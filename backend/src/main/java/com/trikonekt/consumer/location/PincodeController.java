package com.trikonekt.consumer.location;

import com.trikonekt.consumer.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/location")
public class PincodeController {
  private final PincodeService pincodeService;

  @org.springframework.beans.factory.annotation.Value("${app.mapbox.api-key:}")
  private String mapboxApiKey;

  public PincodeController(PincodeService pincodeService) {
    this.pincodeService = pincodeService;
  }

  @GetMapping("/pincode/{pinCode}")
  public ApiResponse<LocationResponse> findByPincode(@PathVariable String pinCode) {
    return ApiResponse.ok("Location found", pincodeService.findByPincode(pinCode));
  }

  @GetMapping("/config")
  public ApiResponse<java.util.Map<String, String>> getMapboxConfig() {
    return ApiResponse.ok("Mapbox config retrieved", java.util.Map.of("mapboxApiKey", mapboxApiKey));
  }
}
