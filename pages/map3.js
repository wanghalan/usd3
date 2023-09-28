import React, { useState, useEffect } from "react"
import { geoAlbersUsa, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client";

const projection = geoAlbersUsa()
  .scale(1000)
  .translate([ 800 / 2, 450 / 2 ])

export default function Map({url, geoName, stroke}) {
  const [geographies, setGeographies] = useState([]);
  const [geoFills, setFills] = useState([]);

  useEffect(() => {
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return
        }
        
        response.json().then(data => {
          console.log(feature(data, data.objects[geoName]))
            setGeographies(feature(data, data.objects[geoName]).features);
          }).then(() => {
            setFills(Array(geographies.length).fill('#DADADA'));
          })
      })
  }, [])

  const handleClick = (i) => {
    const nextFills = geoFills.slice();
    nextFills[i] !== '#E57200' ? nextFills[i] = '#E57200' : nextFills[i] = '#DADADA';
    setFills(nextFills);
  }

  return (
    <svg viewBox="0 0 800 450" width="100%" height="100%">
      <g className={geoName}>
        {
          geographies.map((d,i) => (
            <path
              key={ `path-${ i }` }
              d={ geoPath().projection(projection)(d) }
              fill={geoFills[i] !== '#E57200' ? '#DADADA' : geoFills[i]}
              stroke={stroke}
              strokeWidth={ 0.5 }
              onClick={() => handleClick(i)}
            />
          ))
        }
      </g>
      
    </svg>
  )
};