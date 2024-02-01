import axios from "axios";
import PackageData from "../interfaces/searchData";
import { load } from "cheerio";
class Search {
  static async npm(name: string): Promise<PackageData | null> {
    let { data } = await axios
      .get(`https://registry.npmjs.org/${name}`)
      .catch(() => {
        return { data: { error: "error" } };
      });
    if (data.error) return null;

    let packageData: PackageData = {
      name: data.name,
      description: data.description,
      url: `https://npmjs.com/package/${data.name}`,
      version: data["dist-tags"].latest,
      keywords: data.keywords,
      icon: `https://static-production.npmjs.com/1996fcfdf7ca81ea795f67f093d7f449.png`, //npmjs logo
    };
    return packageData;
  }

  static async npmAutoComplete(name: string): Promise<string[]> {
    let { data } = await axios
      .get(`https://www.npmjs.com/search/suggestions?q=${name}`)
      .catch(() => {
        return { data: null };
      });
    if (!data) return [];
    let names = data.map((d: any) => d.name as string) as string[];
    return names;
  }

  static async pypi(name: string): Promise<PackageData | null> {
    let { data } = await axios
      .get(`https://pypi.org/pypi/${name}/json`)
      .catch(() => {
        return { data: { message: "error" } };
      });
    if (data.message) return null;

    let packageData: PackageData = {
      name: data.info.name,
      description: data.info.summary,
      url: `https://pypi.org/project/${data.info.name}`,
      version: data.info.version,
      keywords: data.info.keywords.split(","),
      icon: `https://i.pinimg.com/564x/91/9d/4f/919d4f7908c29e21cfeebfd3cbd043b1.jpg`, //pypi logo
    };
    return packageData;
  }

  static async pypiAutoComplete(name: string): Promise<string[]> {
    let { data: html } = await axios
      .get(`https://pypi.org/search/?q=${name}`)
      .catch(() => {
        return { data: null };
      });

    if (!html) return [];

    let $ = load(html);
    let names = $("span[class=package-snippet__name]")
      .map((_i, a) => $(a).text())
      .toArray() as string[];
    console.log(names);
    return names;
  }

  static async cargo(name: string): Promise<PackageData | null> {
    let { data } = await axios
      .get(`https://crates.io/api/v1/crates/${name}`)
      .catch(() => {
        return { data: { errors: "error" } };
      });

    if (data.errors) return null;

    let packageData: PackageData = {
      name: data.crate.name,
      description: data.crate.description,
      url: `https://crates.io/crates/${data.crate.name}`,
      version: data.crate.max_version,
      keywords: data.crate.keywords,
      icon: `https://crates.io/assets/cargo.png`, //crates.io logo
    };
    return packageData;
  }
  static async cargoAutoComplete(name: string): Promise<string[]> {
    let { data } = await axios
      .get(`https://crates.io/api/v1/crates?page=1&per_page=25&q=${name}`)
      .catch(() => {
        return { data: null };
      });
    if (!data) return [];
    let names = data.crates.map((d: any) => d.name as string) as string[];
    return names;
  }
}

export default Search;
export { Search };
