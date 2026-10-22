package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.FreightQuote;
import com.freshmcalc.domain.entity.Port;
import com.freshmcalc.domain.entity.ShippingRoute;
import com.freshmcalc.domain.repository.FreightQuoteRepository;
import com.freshmcalc.domain.repository.PortRepository;
import com.freshmcalc.domain.repository.ShippingRouteRepository;
import com.freshmcalc.dto.RouteDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ShippingRouteService {

    private final ShippingRouteRepository routeRepository;
    private final FreightQuoteRepository quoteRepository;
    private final PortRepository portRepository;

    public ShippingRouteService(ShippingRouteRepository routeRepository,
                                FreightQuoteRepository quoteRepository,
                                PortRepository portRepository) {
        this.routeRepository = routeRepository;
        this.quoteRepository = quoteRepository;
        this.portRepository = portRepository;
    }

    public List<RouteDto.ShippingRouteResponse> listRoutes() {
        return routeRepository.findAll().stream().map(this::toRouteResponse).collect(Collectors.toList());
    }

    @Transactional
    public RouteDto.ShippingRouteResponse createRoute(RouteDto.CreateShippingRouteRequest req) {
        if (req.originPortId().equals(req.destinationPortId())) {
            throw new BadRequestException("Origin and destination ports must be different.");
        }
        Port origin = portRepository.findById(req.originPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Origin port not found: " + req.originPortId()));
        Port destination = portRepository.findById(req.destinationPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Destination port not found: " + req.destinationPortId()));

        ShippingRoute route = new ShippingRoute();
        route.setOriginPort(origin);
        route.setDestinationPort(destination);
        route.setTransitTimeDays(req.transitTimeDays());
        route.setTransitTimeSource(req.transitTimeSource());
        route.setTransshipmentRequired(Boolean.TRUE.equals(req.transshipmentRequired()));
        route.setTransshipmentLegs(req.transshipmentLegs());
        boolean operational = req.operational() == null || req.operational();
        route.setOperational(operational);
        if (operational) {
            route.setActivatedAt(Instant.now());
            route.setActivatedBy("ADMIN");
        }
        return toRouteResponse(routeRepository.save(route));
    }

    @Transactional
    public RouteDto.FreightQuoteResponse createFreightQuote(RouteDto.CreateFreightQuoteRequest req) {
        ShippingRoute route = routeRepository.findById(req.routeId())
            .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + req.routeId()));
        FreightQuote q = new FreightQuote();
        q.setRoute(route);
        q.setContainerType(req.containerType());
        q.setAmount(req.amount());
        q.setCurrency(req.currency());
        q.setSource(req.source());
        Instant effectiveDate = req.effectiveDate() != null ? req.effectiveDate() : Instant.now();
        if (req.expiryDate() != null && !req.expiryDate().isAfter(effectiveDate)) {
            throw new BadRequestException("Freight-quote expiry must be after its effective date.");
        }
        q.setEffectiveDate(effectiveDate);
        q.setExpiryDate(req.expiryDate());
        return toQuoteResponse(quoteRepository.save(q));
    }

    public List<RouteDto.FreightQuoteResponse> listFreightQuotes() {
        return quoteRepository.findAll().stream().map(this::toQuoteResponse).collect(Collectors.toList());
    }

    private RouteDto.ShippingRouteResponse toRouteResponse(ShippingRoute r) {
        return new RouteDto.ShippingRouteResponse(
            r.getId(), r.getOriginPort() != null ? r.getOriginPort().getId() : null,
            r.getOriginPort() != null ? r.getOriginPort().getName() : null,
            r.getDestinationPort() != null ? r.getDestinationPort().getId() : null,
            r.getDestinationPort() != null ? r.getDestinationPort().getName() : null,
            r.getTransitTimeDays(), r.getTransitTimeSource(),
            r.getTransshipmentRequired(), r.getTransshipmentLegs(), r.getOperational());
    }

    private RouteDto.FreightQuoteResponse toQuoteResponse(FreightQuote q) {
        return new RouteDto.FreightQuoteResponse(
            q.getId(), q.getRoute() != null ? q.getRoute().getId() : null, q.getContainerType(),
            q.getAmount(), q.getCurrency(), q.getSource(), q.getEffectiveDate(), q.getExpiryDate());
    }
}
