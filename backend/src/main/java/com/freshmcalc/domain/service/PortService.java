package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.City;
import com.freshmcalc.domain.entity.Country;
import com.freshmcalc.domain.entity.Port;
import com.freshmcalc.domain.repository.CityRepository;
import com.freshmcalc.domain.repository.CountryRepository;
import com.freshmcalc.domain.repository.PortRepository;
import com.freshmcalc.dto.PortDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PortService {

    private final PortRepository portRepository;
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;

    public PortService(PortRepository portRepository,
                       CountryRepository countryRepository,
                       CityRepository cityRepository) {
        this.portRepository = portRepository;
        this.countryRepository = countryRepository;
        this.cityRepository = cityRepository;
    }

    public List<PortDto.PortResponse> listPorts() {
        return portRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PortDto.CountryResponse> listCountries() {
        return countryRepository.findAllByOrderByNameAsc().stream()
            .map(c -> new PortDto.CountryResponse(c.getId(), c.getName(), c.getCode(), c.getCurrencyCode()))
            .toList();
    }

    public List<PortDto.CityResponse> listCities(Long countryId) {
        if (countryId == null) {
            throw new BadRequestException("A country is required.");
        }
        return cityRepository.findByCountryIdOrderByNameAsc(countryId).stream()
            .map(c -> new PortDto.CityResponse(c.getId(), c.getCountry().getId(), c.getName(), c.getState()))
            .toList();
    }

    @Transactional
    public PortDto.PortResponse createPort(PortDto.CreatePortRequest req) {
        Country country = countryRepository.findById(req.countryId())
            .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + req.countryId()));
        City city = cityRepository.findById(req.cityId())
            .orElseThrow(() -> new ResourceNotFoundException("City not found: " + req.cityId()));
        if (!country.getId().equals(city.getCountry().getId())) {
            throw new BadRequestException("The selected city does not belong to the selected country.");
        }

        Port p = new Port();
        p.setCountry(country);
        p.setCity(city);
        p.setCountryName(country.getName());
        p.setCityName(city.getName());
        p.setName(req.name().trim());
        p.setUnlocode(req.unlocode().trim().toUpperCase());
        p.setPortType(req.portType());
        p.setSupportsContainer(Boolean.TRUE.equals(req.supportsContainer()));
        p.setSupportsReefer(Boolean.TRUE.equals(req.supportsReefer()));
        p.setActive(true);
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
