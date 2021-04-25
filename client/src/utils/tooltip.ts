import {isEqual, isEmpty} from 'lodash';
import {readCache, writeCache} from './cache';

export interface TooltipData {
  type: string;
  appVersion: string;
}

const CACHE_NAME_TOOLTIP = 'tooltipData';
const tooltipSeen = async (tooltipDataSearch: TooltipData) => {
  const tooltipData: TooltipData[] = await readTooltipDataFromCache();
  // If not in tooltipData, it's never been seen
  if (tooltipData === null || isEmpty(tooltipData)) {
    createNewTooltipData(tooltipDataSearch);
    return false;
  }
  const searchResult = await findTooltipData({tooltipData, tooltipDataSearch});
  if (searchResult.length > 0) return true;
  else return false;
};

const createNewTooltipData = async (newTooltipData: TooltipData) => {
  const tooltipData: TooltipData[] = await readTooltipDataFromCache();
  if (!isEmpty(tooltipData)) {
    // Append
    await writeCache(CACHE_NAME_TOOLTIP, [...tooltipData, {...newTooltipData}]);
  } else {
    // Make new array
    await writeCache(CACHE_NAME_TOOLTIP, [{...newTooltipData}]);
  }
};

const readTooltipDataFromCache = () => readCache(CACHE_NAME_TOOLTIP);

const findTooltipData = async ({
  tooltipDataSearch,
  tooltipData,
}: {
  tooltipDataSearch: TooltipData;
  tooltipData: TooltipData[];
}) => {
  // If not supplied, read tooltipDate from cache
  if (isEmpty(tooltipData)) tooltipData = await readTooltipDataFromCache();
  return tooltipData.filter(tooltipData =>
    isEqual(tooltipData, tooltipDataSearch),
  );
};

export {findTooltipData, tooltipSeen};
