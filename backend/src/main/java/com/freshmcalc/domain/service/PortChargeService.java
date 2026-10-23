package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Port;
import com.freshmcalc.domain.entity.PortCharge;
import com.freshmcalc.domain.repository.PortChargeRepository;
import com.freshmcalc.domain.repository.PortRepository;
import com.freshmcalc.dto.PortChargeDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ConflictException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PortChargeService {

    private final PortChargeRepository chargeRepository;
    private final PortRepository portRepository;

    public PortChargeService(PortChargeRepository chargeRepository, PortRepository portRepository) {
        this.chargeRepository = chargeRepository;
        this.portRepository = portRepository;
    }

    /** Returns only active records matching the selected route and shipment filters. */
    public List<PortChargeDto.PortChargeResponse> listApplicable(
        Long originPortId,
        Long destinationPortId,
        String containerType,
        String shippingMode,
        String productName,
        Instant asOf
    ) {
        if (originPortId == null || destinationPortId == null) return List.of();
        Instant requestedAt = asOf == null ? Instant.now() : asOf;
        List<PortCharge> rows = chargeRepository.findByPort_IdIn(List.of(originPortId, destinationPortId));
        return rows.stream()
            .filter(c -> Boolean.TRUE.equals(c.getActive()))
            .filter(c -> Objects.equals(c.getPort().getId(), originPortId)
                ? "ORIGIN".equals(c.getDirection())
                : Objects.equals(c.getPort().getId(), destinationPortId) && "DESTINATION".equals(c.getDirection()))
            .filter(c -> matches(c.getContainerType(), containerType))
            .filter(c -> matches(c.getShippingMode(), shippingMode) || "ANY".equals(c.getShippingMode()))
            .filter(c -> c.getProductName() == null || c.getProductName().isBlank()
                || (productName != null && c.getProductName().equalsIgnoreCase(productName.trim())))
            .sorted(Comparator.comparing(PortCharge::getDirection).thenComparing(PortCharge::getChargeCategory))
            .map(c -> toResponse(c, requestedAt))
            .toList();
    }

    public List<PortChargeDto.PortChargeResponse> listAdmin() {
        Instant now = Instant.now();
        return chargeRepository.findAll().stream()
            .sorted(Comparator.comparing(PortCharge::getEffectiveFrom, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(c -> toResponse(c, now))
            .toList();
    }

    @Transactional
    public PortChargeDto.PortChargeResponse create(PortChargeDto.PortChargeRequest req) {
        Port port = portRepository.findById(req.portId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.portId()));
        validate(req, port);
        assertNoDuplicate(req, null);
        PortCharge charge = new PortCharge();
        apply(charge, req, port);
        return toResponse(chargeRepository.save(charge), Instant.now());
    }

    @Transactional
    public PortChargeDto.PortChargeResponse update(Long id, PortChargeDto.PortChargeRequest req) {
        PortCharge charge = chargeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Port charge not found: " + id));
        Port port = portRepository.findById(req.portId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.portId()));
        validate(req, port);
        assertNoDuplicate(req, id);
        apply(charge, req, port);
        return toResponse(chargeRepository.save(charge), Instant.now());
    }

    private void validate(PortChargeDto.PortChargeRequest req, Port port) {
        if (req.effectiveUntil() != null && !req.effectiveUntil().isAfter(req.effectiveFrom())) {
            throw new BadRequestException("The valid-until date must be later than the valid-from date.");
        }
        String portType = upper(port.getPortType());
        if (!"BOTH".equals(portType) && !req.direction().equals(portType)) {
            throw new BadRequestException("Charge direction must match the port's configured role.");
        }
        if ("VERIFIED".equals(req.verificationStatus())
            && ((req.source() == null || req.source().isBlank()) || req.lastVerifiedAt() == null)) {
            throw new BadRequestException("A verified charge requires a data source and verification date.");
        }
        if (req.lastVerifiedAt() != null && req.lastVerifiedAt().isAfter(Instant.now())) {
            throw new BadRequestException("Verification date cannot be in the future.");
        }
    }

    private void assertNoDuplicate(PortChargeDto.PortChargeRequest req, Long excludeId) {
        boolean duplicate = chargeRepository.existsDuplicateRecord(
            req.portId(), upper(req.direction()), upper(req.chargeCategory()), req.description().trim(),
            upper(req.currency()), upper(req.chargingBasis()), upper(req.shippingMode()),
            blankToNullUpper(req.containerType()), blankToNull(req.productName()), req.effectiveFrom(),
            blankToNull(req.source()), excludeId);
        if (duplicate) throw new ConflictException("An identical charge record already exists for this port and validity start date.");
    }

    private void apply(PortCharge charge, PortChargeDto.PortChargeRequest req, Port port) {
        charge.setPort(port);
        charge.setDirection(upper(req.direction()));
        charge.setChargeCategory(upper(req.chargeCategory()));
        charge.setDescription(req.description().trim());
        charge.setAmount(req.amount());
        charge.setCurrency(upper(req.currency()));
        charge.setChargingBasis(upper(req.chargingBasis()));
        charge.setShippingMode(upper(req.shippingMode()));
        charge.setContainerType(blankToNullUpper(req.containerType()));
        charge.setProductName(blankToNull(req.productName()));
        charge.setConditions(blankToNull(req.conditions()));
        charge.setEffectiveFrom(req.effectiveFrom());
        charge.setEffectiveUntil(req.effectiveUntil());
        charge.setSource(blankToNull(req.source()));
        charge.setLastVerifiedAt(req.lastVerifiedAt());
        charge.setVerificationStatus(upper(req.verificationStatus()));
        charge.setActive(req.active());
    }

    private boolean matches(String configured, String selected) {
        return configured == null || configured.isBlank() || selected == null
            || configured.equalsIgnoreCase(selected.trim());
    }

    private String statusAt(PortCharge charge, Instant asOf) {
        if (!Boolean.TRUE.equals(charge.getActive())) return "INACTIVE";
        if (charge.getEffectiveFrom() != null && charge.getEffectiveFrom().isAfter(asOf)) return "FUTURE";
        if (charge.getEffectiveUntil() != null && charge.getEffectiveUntil().isBefore(asOf)) return "EXPIRED";
        return upper(charge.getVerificationStatus());
    }

    private PortChargeDto.PortChargeResponse toResponse(PortCharge c, Instant asOf) {
        Port port = c.getPort();
        return new PortChargeDto.PortChargeResponse(
            c.getId(), port == null ? null : port.getId(), port == null ? null : port.getName(),
            port == null ? null : port.getUnlocode(), c.getDirection(), c.getChargeCategory(), c.getDescription(),
            c.getAmount(), c.getCurrency(), c.getChargingBasis(), c.getShippingMode(), c.getContainerType(),
            c.getProductName(), c.getConditions(), c.getEffectiveFrom(), c.getEffectiveUntil(), c.getSource(),
            c.getLastVerifiedAt(), upper(c.getVerificationStatus()), statusAt(c, asOf), c.getActive(), c.getCreatedAt(), c.getCreatedBy(),
            c.getUpdatedAt(), c.getUpdatedBy());
    }

    private String upper(String value) {
        return value == null ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String blankToNullUpper(String value) {
        String normalized = blankToNull(value);
        return normalized == null ? null : normalized.toUpperCase(Locale.ROOT);
    }
}
