
import { TestWidget } from '../components/pagecomp/widget/TestWidget.jsx'
import { TestStationWidget } from '../components/pagecomp/widget/TestStationWidget.jsx';
import { FixtureStationWidget } from '../components/pagecomp/widget/FixtureStationWidget.jsx';
import { PackingChartWidget } from '../components/pagecomp/widget/PackingChartWidget.jsx'
import { ParetoWidget } from '../components/pagecomp/widget/ParetoWidget.jsx';
import { PackingOutputWidget } from '../components/pagecomp/widget/PackingOutputWidget.jsx';

export const widgetList = [
  {type:"Station performance chart",comp:TestStationWidget,tools:["dateRange","barLimit"]},
  {type:"Fixture performance chart",comp:FixtureStationWidget,tools:["dateRange","barLimit"]},
  {type:"Packing output table",comp:PackingOutputWidget,tools:["dateRange"]},
  {type:"Packing chart",comp:PackingChartWidget,tools:["weekRange"]},
  {type:"Pareto chart",comp:ParetoWidget,tools:["dateRange","barLimit"]},
];