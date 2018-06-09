export interface Service {
  getState();

  getHeadSensibility();

  click();

  getLetter();

  shouldHighlight(row, col);

  headDown();

  headRight();

  headRight();

  headLeft();

  getDataReceivedThreshold();
}
