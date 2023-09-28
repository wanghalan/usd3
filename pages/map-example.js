import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { json } from "d3-fetch";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

const Map = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json').then(counties => {
        counties.map((county) => {
            String(county.fips).length < 5 ? county.fips = "0" + String(county.fips) : county.fips = String(county.fips);
        })
        setData(counties);
    });
  }, []);

  const colorScale = scaleQuantile()
    .domain(data.map(d => d.bachelorsOrHigher))
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618"
    ]);

  return (
    <ComposableMap projection="geoAlbersUsa">
      <ZoomableGroup center={[0, 0]} zoom={9}>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map(geo => {
            const cur = data.find(s => s.fips === geo.id);

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={cur ? colorScale(cur.bachelorsOrHigher) : "#EEE"}
              />
            );
          })
        }
      </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default Map;