const superagent = require("superagent");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

interface Course {
  src: string;
  title: string;
}

interface CourseResult {
  time: number;
  data: Course[];
}

interface Content {
  [propName: number]: Course[];
}

class Crawler {
  private token = "token";
  private url = "http://sc-light.com/?productlist/";

  getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $(".project-content-right ul li");
    const courseInfos: Course[] = [];
    courseItems.map((index: number, element: Element) => {
      const src = $(element).find("img").attr("src");
      const title = $(element).find(".project-title").eq(0).text();
      courseInfos.push({ src, title });
    });

    return {
      time: new Date().getTime(),
      data: courseInfos,
    };
  }

  async getRawHtml() {
    const result = await superagent.get(this.url);
    return result.text;
  }

  generateJsonContent(courseInfo: CourseResult) {
    const filePath = path.resolve(__dirname, "../data/course.json");
    let fileContent: Content = {};
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    fileContent[courseInfo.time] = courseInfo.data;
    return fileContent;
  }

  async initSpiderProcess() {
    const filePath = path.resolve(__dirname, "../data/course.json");
    const html: string = await this.getRawHtml();
    const courseInfo = this.getCourseInfo(html);
    const fileContent = this.generateJsonContent(courseInfo);
    fs.writeFileSync(filePath, JSON.stringify(fileContent));
    console.log(1);
  }

  constructor() {
    this.initSpiderProcess();
  }
}

const crawler = new Crawler();
console.log(crawler);
