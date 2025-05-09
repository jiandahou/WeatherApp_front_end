import { useEffect, useState } from 'react';
import moment, { type Moment } from 'moment';

export function useClock(format = 'MMMM Do YYYY, h:mm:ss a') {
  const [time, setTime] = useState<Moment>(() => moment());

  useEffect(() => {
    const id = setInterval(() => setTime(moment()), 1000);
    return () => clearInterval(id);
  }, []);

  return time.format(format);
}