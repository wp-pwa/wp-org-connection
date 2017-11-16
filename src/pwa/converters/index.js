export default ({ entities }) => {
  Object.entries(entities).forEach(([key, value]) => {
    let type = 'single';
    if (key === 'author') type = 'author';
    
  })
};
