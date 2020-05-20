export default function fuzzyPathSearch(paths, query) {
  return paths.filter(path => path.includes(query));
}
