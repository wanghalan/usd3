import Layout from '../components/layout';
import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import BarChart from './test-bar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import styles from '../styles/Home.module.css';
import Map from './map.js';
import WorldMap from './map.js';

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
      <select name={name} id={name} className={styles.FilterDropdown} multiple size='3'>
        {options}
      </select>
    </div>
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

  const topicButtons = topics.map((topic) => {
    return (
      <div className={styles.TabContainer} key={topic} onClick={() => setActiveTab(topic)}>
        <TopicTab topic={topic} activeTab={activeTab}/>
      </div>
    );
  });
  const VisBoxes = topics.map((topic) => {
    return (
      <span key={topic} className={styles.RowContent + " " + styles.VisContainer + " " + (activeTab === topic ? styles.ContentVisible : styles.ContentInvisible)}>
        <VisContents topic={topic} data={data} resolution={currRes} region={currRegion} year={currYear}></VisContents>
      </span>
    );
  });

  return (<Layout home> 
    <div className={styles.Box}>
      <div className={styles.TopicBar}>{topicButtons}</div>
      <div id={styles.MainContent} className={styles.RowContent}>
        {VisBoxes}

        {/* filter box */}
        <div id={styles.FilterBox} className={styles.RowContent}>
          <div id={styles.FilterHead}>
            <svg id={styles.FilterIcon} viewBox="0 0 518.462 518.462"><g> <g> <g> <path d="M518.462,22.82H0l193.159,203.495l-0.014,269.327l132.173-68.37l-0.014-200.957L518.462,22.82z M212.837,463.286 l0.014-244.827L45.846,42.512h426.769L305.611,218.459l0.014,196.832L212.837,463.286z"></path> </g> </g> </g></svg>
            Select Filters
          </div>
          <div id={styles.FilterItems}>
            <div id={styles.FilterMap}><Map></Map></div>
            <FilterSelector name="Region" range={['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia']} multiple={true}/>

            <div id={styles.SelectedDesc}>
              Regions Selected
              <div id={styles.SelectedBox}>
                Select regions by clicking on the map above or by using the region selector below.
              </div>
            </div>

            <FilterSelector name="Resolution" range={['---- Select a Resolution ----', 'County', 'Census Tract', 'Block Group']}/>
            <FilterSelector name="Year" range={['---- Select a Year ----', 2019, 2020, 2021]}/>
          </div>
        </div>
        {/* filter box */}

      </div>
    </div>
  </Layout>);

};

