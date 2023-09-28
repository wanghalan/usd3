import React, { useState, useEffect } from "react"
import { geoAlbersUsa, geoPath } from "d3-geo"
import { feature } from "topojson-client"

const projection = geoAlbersUsa()
  .scale(1000)
  .translate([ 800 / 2, 450 / 2 ])

const Map = () => {
  const [counties, setCounties] = useState([])
  const [states, setStates] = useState([])
  
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return
        }
        response.json().then(data => {
          setCounties(feature(data, data.objects.counties).features)
        })
      })
  }, [])
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json")
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return
        }
        response.json().then(data => {
          setStates(feature(data, data.objects.states).features)
        })
      })
  }, [])

  return (
    <svg viewBox="0 0 800 450" width="100%" height="100%">
      <g className="counties">
        {
          counties.map((d,i) => (
            <path
              key={ `path-${ i }` }
              d={ geoPath().projection(projection)(d) }
              fill="#DADADA"
              stroke="#FFFFFF"
              strokeWidth={ 0.5 }
            />
          ))
        }
      </g>
      <g className="states">
        {
          states.map((d,i) => (
            <path
              key={ `path-${ i }` }
              d={ geoPath().projection(projection)(d) }
              fill="none"
              stroke="#666666"
              strokeWidth={ 0.5 }
            />
          ))
        }
      </g>
      
    </svg>
  )
}

export default Map
