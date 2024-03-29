import axios from "axios";
import { PackageData, w3schoolsData } from "../interfaces/searchData";
import { load } from "cheerio";

class Search {
  static unescapeHTML(html: string): string {
    return load(html).text();
  }

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

  static async w3schools(name: string): Promise<w3schoolsData | null> {
    let results = await this.w3schoolsAutoComplete(name);
    if (!results) return null;
    let result = results[0];
    let { data: html } = await axios.get(result.url).catch((e) => {
      console.log(e);
      return { data: null };
    });

    if (!html) return null;
    let $ = load(html);
    let code = $(".w3-code").html() ? $(".w3-code") : $("pre");
    if (!code) return null;
    let snippet = code.first().text() || undefined;
    /* .toArray()
      .map((c) => $(c).text())
      .join("\n");*/

    let highlight = result.url.split("/").at(-2)?.toLocaleLowerCase() || null;
    if (highlight === "tag") highlight = "html";
    /*
      $(code)
        .attr("class")
        ?.split(" ")
        ?.filter((c) => /(language|high)/gi.test(c))?.[0]
        ?.replace(/(language|high|-)/gi, "") || null;*/

    result.snippet = snippet;
    result.highlight = highlight;
    return result;
  }

  static async w3schoolsAutoComplete(
    name: string
  ): Promise<w3schoolsData[] | null> {
    let { data } = await axios
      .get(`https://google.com/search?q=${name}+w3schools`)
      .catch(() => {
        return { data: null };
      });

    let $ = load(data);

    let results = $("div[id=main] > div")
      .filter(
        (i, e) =>
          $(e).text().includes("w3schools.com") && $(e).text().includes("›")
      )
      .map((i, e) => {
        return {
          title:
            $(e)
              .find(
                "div > div:nth-child(1) > a > div > div:nth-child(1) > h3 > div"
              )
              .text() ||
            $(e).find("a").find("span").eq(0).text() ||
            "",
          url: $(e)
            .find("a")
            .attr("href")
            ?.replace("/url?q=", "")
            .replace(/&sa=.*/, ""),
          description:
            $(e)
              .find("div > div:nth-child(2) > div > div > div > div > div")
              .text()
              .replaceAll("�", "") ||
            $(e)
              .find("div > div:nth-child(1) > div > div > div > div")
              .text()
              .replaceAll("�", "") ||
            "no description found",
          highlight: null,
        };
      })
      .toArray() as w3schoolsData[];

    return results;
  }

  static async mdn(name: string): Promise<string | null> {
    let { data } = await axios
      .get(`https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${name}`)
      .catch(() => {
        return { data: null };
      });
    if (!data) return null;
    let $ = load(data);
    let description = $("meta[name=description]").attr("content");
    if (!description) return null;
    return description;
  }
}
export default Search;
export { Search };
