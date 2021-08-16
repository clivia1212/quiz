
export const getQueryString = (key) => {
  const { search } = window.location;
  const qs = search.slice(1).split('&');
  let value = '';
  qs.some((q) => {
    if (q.indexOf(key) >= 0) {
      value = q.split('=')[1] || '';
      return true;
    }
    return false;
  });
  return value;
};
