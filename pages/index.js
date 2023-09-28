import Layout from '../components/layout';
import React, { useState, useEffect } from "react";
import BarChart from './test-bar';
import Map from './map3.js';
import MeshMap from './mesh-map.js';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from '../styles/Home.module.css';

function TopicTab({topic, activeTab}) {
  return <button className={styles.TopicTab + ' ' + (activeTab === topic ? styles.ActiveTab : "")}>{topic}</button>;
};

function SummaryItem({value, description}) {
  return (
    <div className={styles.SummaryItem}>
      <span className={styles.SummaryValue}>{value}</span>
      <br/>
      <span className={styles.SummaryDesc}>{description}</span>
    </div>
  );
};

function VisContents({topic, data, resolution, region, year}) {
  return (
    <div>
      <div className={styles.TitleBox}>
        <h4>{topic + ": " + resolution + "s in " + region + ", " + year}</h4>
        Variable Name
      </div>
      <div className={styles.SummaryBox}>
        <SummaryItem value="0.82%" description="average percentage of income for internet"></SummaryItem>
        <SummaryItem value="0.74%" description="median percentage of income for internet"></SummaryItem>
      </div>
      <BarChart data={data} />
    </div>
  );
};

function FilterSelector({name, range, multiple=false}) {
  const options = range.map((value) => {
    return (
        <option key={value} value={value}>{value}</option>
    );
  });
  
  if (!multiple) {
    return(
      <div className={styles.FilterSelector} >
        <select name={name} id={name} className={styles.FilterDropdown}>
          {options}
        </select>
      </div>
    );
  }

  // allow for multiple selections
  return(
    <div className={styles.FilterSelector} >
      <select name={name} id={name} className={styles.FilterDropdown} multiple size='5'>
        {options}
      </select>
    </div>
  );
}

function ToggleIcon({open, size}) {
  return(
    open ? <div className={styles.ToggleIcon} style={{'width':size}}><svg  viewBox="0 0 1 1"><polygon points="0 0, 0.5 0.6, 1 0"/></svg></div> :
          <div className={styles.ToggleIcon} style={{'width':size}}><svg  viewBox="0 0 1 1"><polygon points="0 0.6, 0.5 0, 1 0.6"/></svg></div>
  );
}

export default function Home() {
  const data = [
    {year: 1980, efficiency: 24.3, sales: 8949000},
    {year: 1985, efficiency: 27.6, sales: 10979000},
    {year: 1990, efficiency: 28, sales: 9303000},
    {year: 1991, efficiency: 28.4, sales: 8185000},
    {year: 1992, efficiency: 27.9, sales: 8213000},
    {year: 1993, efficiency: 28.4, sales: 8518000},
    {year: 1994, efficiency: 28.3, sales: 8991000},
    {year: 1995, efficiency: 28.6, sales: 8620000},
    {year: 1996, efficiency: 28.5, sales: 8479000},
    {year: 1997, efficiency: 28.7, sales: 8217000},
    {year: 1998, efficiency: 28.8, sales: 8085000},
    {year: 1999, efficiency: 28.3, sales: 8638000},
    {year: 2000, efficiency: 28.5, sales: 8778000},
    {year: 2001, efficiency: 28.8, sales: 8352000},
    {year: 2002, efficiency: 29, sales: 8042000}];
  const topics = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6'];

  const [activeTab, setActiveTab] = useState(topics[0]);
  const [currRes, setRes] = useState("Census Tract");
  const [currRegion, setRegion] = useState("Virginia");
  const [currYear, setYear] = useState("2019");
  const [mapVisible, setMapVisible] = useState(false);

  const visMobilePosition = (topics.indexOf(activeTab) * 2) + 1;

  // true if window is larger than 480px
  const largeWindow = useMediaQuery('(min-width:480px)');
  const [filterVisible, setFilterVisible] = useState();

  // setting filter visibility based on initial window size
  useEffect(() => {
    window.innerWidth > 480 ? setFilterVisible(true) : setFilterVisible(false);
  }, []);

  // setting filter visibility based on window resize
  useEffect(() => {
    const handleResize = () => {
      window.innerWidth > 480 ? setFilterVisible(true) : setFilterVisible(false);
      if (activeTab === '') setActiveTab(topics[0]);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [activeTab]);

  const mobileTopicClick = ({topic}) => {
    if (activeTab !== topic) {
      setActiveTab(topic);
    }
    else {
      setActiveTab('');
    }
  }

  const topicButtons = topics.map((topic, i) => {
    return (
      <div className={styles.TabContainer} id={topic + "Tab"} key={topic} onClick={largeWindow ? () => setActiveTab(topic) : () => mobileTopicClick({topic})} style={{'order': i*2}}>
        <TopicTab topic={topic} activeTab={activeTab}/>
      </div>
    );
  });
  const VisBoxes = topics.map((topic) => {
    return (
      <span style={{'order': (largeWindow ? 0 : visMobilePosition)}} key={topic} className={styles.RowContent + " " + styles.VisContainer + " " + (activeTab === topic ? styles.ContentVisible : styles.ContentInvisible)}>
        <VisContents topic={topic} data={data} resolution={currRes} region={currRegion} year={currYear}/>
      </span>
    );
  });

  const Filter = (
        <div id={styles.FilterBox} className={styles.RowContent} style={(!filterVisible || largeWindow) ? {} : {'minHeight': "100%"}}>
        <div id={styles.FilterHead} onClick={largeWindow? () => {} : () => setFilterVisible(!filterVisible)}>
          <div id={styles.FilterHeadItems}>
            <div>
              <svg id={styles.FilterIcon} viewBox="0 0 518.462 518.462"><g> <g> <g> <path d="M518.462,22.82H0l193.159,203.495l-0.014,269.327l132.173-68.37l-0.014-200.957L518.462,22.82z M212.837,463.286 l0.014-244.827L45.846,42.512h426.769L305.611,218.459l0.014,196.832L212.837,463.286z"></path> </g> </g> </g></svg>
              Select Filters
            </div>
            {largeWindow ? <></> : <ToggleIcon open={filterVisible} size={'8%'}/>}
          </div>
        </div>
        <div id={styles.FilterItems} className={filterVisible ? '' : styles.ContentInvisible}>
          <div id={styles.MapContainer}>
            <div id={styles.MapToggle} onClick={() => setMapVisible(!mapVisible)}>
              Click to Filter Using Map
              <ToggleIcon open={!mapVisible} size={'10px'}/>
            </div>
            <div id={styles.FilterMapBox} className={mapVisible ? '' : styles.ContentInvisible}>
              <TransformWrapper>
              <TransformComponent>
                <svg id={styles.FilterMap}>
                  <Map url="https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json" geoName="counties" stroke="#FFFFFF"/>
                  <MeshMap url="https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json" geoName="states" stroke="#666666"/>
                </svg>
              </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
          
          <FilterSelector name="Region" range={['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia']} multiple={true}/>

          <div id={styles.SelectedDesc}>
            Regions Selected
            <div id={styles.SelectedBox}>
              Select regions above by clicking on the map or using the region selector.
            </div>
          </div>

          <FilterSelector name="Resolution" range={['---- Select a Resolution ----', 'County', 'Census Tract', 'Block Group']}/>
          <FilterSelector name="Year" range={['---- Select a Year ----', 2019, 2020, 2021]}/>
        </div>
        </div>
    );

  return (<Layout home> 
    <div className={styles.Box}>
      {/* topics show as own navbar in desktop view */}
      {largeWindow? <div className={styles.TopicBar}>{topicButtons}</div> : <></>}

      <div id={styles.MainContent} className={styles.RowContent}>
        {/* group topic and corresponding vis in mobile view */}
        {largeWindow ? VisBoxes : <div className={styles.TopicBar}>{topicButtons}{VisBoxes}</div>}
        
        {Filter}
      </div>
    </div>
  </Layout>);

};

