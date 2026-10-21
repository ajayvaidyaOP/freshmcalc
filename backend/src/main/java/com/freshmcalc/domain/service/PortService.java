package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Port;
import com.freshmcalc.domain.repository.PortRepository;
import com.freshmcalc.dto.PortDto;
import com.freshmcalc.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PortService {

    private final PortRepository portRepository;

    public PortService(PortRepository portRepository) {
        this.portRepository = portRepository;
    }

    public List<PortDto.PortResponse> listPorts() {
        return portRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PortDto.PortResponse createPort(PortDto.CreatePortRequest req) {
        Port p = new Port();
        p.setName(req.name());
        p.setUnlocode(req.unlocode());
        p.setPortType(req.portType());
        p.setSupportsContainer(req.supportsContainer());
        p.setSupportsReefer(req.supportsReefer());
        p.setActive(true);
        // country/city would be set via IDs; kept minimal for structure
        return toResponse(portRepository.save(p));
    }

    private PortDto.PortResponse toResponse(Port p) {
        return new PortDto.PortResponse(
            p.getId(), p.getCountry() != null ? p.getCountry().getId() : null,
            p.getCountryName(), p.getCity() != null ? p.getCity().getId() : null,
            p.getCityName(), p.getName(), p.getUnlocode(), p.getPortType(),
            p.getSupportsContainer(), p.getSupportsReefer(), p.getActive());
    }
}
