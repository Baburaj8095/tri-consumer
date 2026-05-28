package com.trikonekt.consumer.location;

public class LocationResponse {
  private String pinCode;
  private String village;
  private String taluk;
  private String district;
  private String state;
  private String country;

  public LocationResponse() {}

  public LocationResponse(String pinCode, String village, String taluk, String district, String state, String country) {
    this.pinCode = pinCode;
    this.village = village;
    this.taluk = taluk;
    this.district = district;
    this.state = state;
    this.country = country;
  }

  public String getPinCode() { return pinCode; }
  public String getVillage() { return village; }
  public String getTaluk() { return taluk; }
  public String getDistrict() { return district; }
  public String getState() { return state; }
  public String getCountry() { return country; }
}
