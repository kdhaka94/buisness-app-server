export const getDifferenceBetweenDates = (date1: Date, date2: Date) => {
  // use a constant date (e.g. 2000-01-01) and the desired time to initialize two dates

  // midnight e.g. when you want to get the difference between 9:00 PM and 5:00 AM

  if (date2 < date1) {
    date2.setDate(date2.getDate() + 1);
  }

  let diff = (date2 as any) - (date1 as any);

  let msec = diff;
  let hh = Math.floor(msec / 1000 / 60 / 60);
  // msec -= hh * 1000 * 60 * 60;
  let mm = Math.floor(msec / 1000 / 60);
  // msec -= mm * 1000 * 60;
  let ss = Math.floor(msec / 1000);
  // msec -= ss * 1000;

  return { hh, mm, ss };
  // 28800000 milliseconds (8 hours)
};
