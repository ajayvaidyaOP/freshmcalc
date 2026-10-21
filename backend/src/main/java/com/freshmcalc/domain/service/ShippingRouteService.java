package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.FreightQuote;
import com.freshmcalc.domain.entity.ShippingRoute;
import com.freshmcalc.domain.repository.FreightQuoteRepository;
import com.freshmcalc.domain.repository.ShippingRouteRepository;
import com.freshmcalc.dto.RouteDto;
import com.freshmcalc.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ShippingRouteService {

    private final ShippingRouteRepository routeRepository;
    private final FreightQuoteRepository quoteRepository;

    public ShippingRouteService(ShippingRouteRepository routeRepository, FreightQuoteRepository quoteRepository) {
        this.routeRepository = routeRepository;
        this.quoteRepository = quoteRepository;
    }

    public List<RouteDto.ShippingRouteResponse> listRoutes() {
        return routeRepository.findAll().stream().map(this::toRouteResponse).collect(Collectors.toList());
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
        q.setEffectiveDate(req.effectiveDate());
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
