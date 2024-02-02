interface PackageData {
  name: string;
  description: string;
  version: string;
  keywords: string[];
  url: string;
  icon: string;
}
interface w3schoolsData {
  title: string;
  description: string;
  url: string;
  highlight: string | null;
  snippet?: string;
}
export default PackageData;
export { PackageData, w3schoolsData };
