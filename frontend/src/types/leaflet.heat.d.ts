declare module "leaflet.heat" {
  import * as L from "leaflet";

  export interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    radius?: number;
    blur?: number;
    max?: number;
    gradient?: { [key: number]: string };
  }

  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): L.Layer;
}

declare module "leaflet" {
  namespace heatLayer {
    function heatLayer(
      latlngs: Array<[number, number, number?]>,
      options?: import("leaflet.heat").HeatLayerOptions
    ): L.Layer;
  }
}

