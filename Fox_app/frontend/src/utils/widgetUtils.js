// utils/widgetUtils.js

import { widgetList } from '../data/widgetList.js';

export const reconstructWidgets = (savedWidgets) => {
  return savedWidgets.map(savedWidget => {
    const widgetConfig = widgetList.find(w => w.type === savedWidget.type);
    return {
      ...savedWidget,
      Widget: widgetConfig?.comp
    };
  }).filter(widget => widget.Widget); // Filter out any widgets that no longer exist
};