const HTMLParser = require("node-html-parser");
const Utils = require("./utils");
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");
const Humanoid = require("humanoid-js");

const VIDEO_EXTENSIONS = [
  "3g2",
  "3gp",
  "avi",
  "flv",
  "mkv",
  "mk3d",
  "mov",
  "mp2",
  "mp4",
  "m4v",
  "mpe",
  "mpeg",
  "mpg",
  "mpv",
  "webm",
  "wmv",
  "ogm",
  "ts",
  "m2ts",
];
const SUBTITLE_EXTENSIONS = [
  "aqt",
  "gsub",
  "jss",
  "sub",
  "ttxt",
  "pjs",
  "psb",
  "rt",
  "smi",
  "slt",
  "ssf",
  "srt",
  "ssa",
  "ass",
  "usf",
  "idx",
  "vtt",
];
function getSize(size) {
  var gb = 1024 * 1024 * 1024;
  var mb = 1024 * 1024;

  return (
    "💾 " +
    (size / gb > 1
      ? `${(size / gb).toFixed(2)} GB`
      : `${(size / mb).toFixed(2)} MB`)
  );
}

function getQuality(name) {
  if (!name) {
    return name;
  }
  name = name.toLowerCase();

  if (["2160", "4k", "uhd"].filter((x) => name.includes(x)).length > 0)
    return "🌟4k";
  if (["1080", "fhd"].filter((x) => name.includes(x)).length > 0)
    return " 🎥FHD";
  if (["720", "hd"].filter((x) => name.includes(x)).length > 0) return "📺HD";
  if (["480p", "380p", "sd"].filter((x) => name.includes(x)).length > 0)
    return "📱SD";
  return "";
}

let headers = {
  Origin: "https://sflix.to",
  Referer: "https://sflix.to/",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
};

//========================== MIXDROP ======================================================================

let mixdrop = async (url = "https://mixdrop.co/e/zplozm3vhje4pr") => {
  let mainUrl = "https://mixdrop.co";
  let srcRegex = /wurl.*?=.*?"(.*?)";/;
  let requiresReferer = false;

  let res = await fetch(url, {
    referrer: url,
    headers: headers,
  });

  if (res.status > 300) {
    console.log("Status code bro: mixdrop");
    return null;
  }

  //Get page content in html
  let source = await res.text();

  if (source.length == 0) {
    console.log("no source bro: mixdrop");
    return null;
  }

  let html = source.split("\n").join("");

  if (!Utils.detect(Utils.getPacked(html))) {
    console.log("no packed thing bro: mixdrop");
    return 0;
  }

  let result = Utils.getAndUnpack(html) ?? "";

  let videoUrl = srcRegex.exec(result) ? srcRegex.exec(result)[1] : null;

  if (videoUrl && videoUrl?.startsWith("//")) {
    videoUrl = "https:" + videoUrl;
  }

  return videoUrl;
};

//========================== VOE ======================================================================
let voe = async (url = "") => {
  console.log("voe");

  if (url.length == 0) {
    return url;
  }
  const mainUrl = "https://voe.sx";
  const requiresReferer = true;

  let res = await fetch(url, {
    referrer: url,
    headers: headers,
  });

  if (res.status > 300) {
    return null;
  }

  //Get page content in html
  let source = await res.text();
  let html = source.split("\n").join("");

  let script = HTMLParser.parse(html)
    .querySelectorAll("script")
    .find((el) => el.textContent.includes("sources =")).textContent;
  let regex = /[\"']hls[\"']:\s*[\"'](.*?)[\"']/;
  let link = regex.exec(script) ? regex.exec(script)[1] : "";

  return link;
};

//
//========================== UPSTREAM ======================================================================
//https://upstream.to/embed-qr7j4o66b5vf.html
let upstream = async (url = "https://upstream.to/embed-qr7j4o66b5vf.html") => {
  if (url.length == 0) {
    return url;
  }
  console.log("upstream");
  const mainUrl = "https://upstream.to";
  const requiresReferer = true;

  let res = await fetch(url, {
    referrer: url,
    headers: headers,
  });

  if (res.status > 300) {
    console.log("Status code bro");
    return null;
  }

  //Get page content in html
  let source = await res.text();

  if (source.length == 0) {
    console.log("no source bro");
    return null;
  }

  let html = source.split("\n").join("");

  if (!Utils.detect(html)) {
    console.log("no packed thing bro");
    return null;
  }

  let result = Utils.getAndUnpack(html);

  let reg = /\[\{file:[\'\"](.*?)[\'\"]\}\]/;

  let videoUrl = reg.exec(result) ? reg.exec(result)[1] : "";

  if (videoUrl.startsWith("/hls")) {
    videoUrl = "https://s18.upstreamcdn.co" + videoUrl;
  }

  return videoUrl ?? null;
};

//
//
// let doodstream = async (url = "https://dood.re/e/zp66moytr8vc") => {
//   let res = await fetch(url);
//   let mainUrl = "https://dood.la";
//   if (res.status > 300) {
//     console.log({ status: res.status });
//     console.log({ headers: res.headers });
//     console.log("Status code bro:dood");
//     return null;
//   }

//   //Get page content in html
//   let source = await res.text();

//   if (source.length == 0) {
//     console.log("no source bro:dood");
//     return null;
//   }

//   let html = source.split("\n").join("");

//   let md5 =
//     mainUrl +
//     (/\/pass_md5\/[^']*/.exec(html) ? /\/pass_md5\/[^']*/.exec(html)[0] : "");

//   console.log({ md5 });

//   //Second request
//   let res2 = await fetch(md5, {
//     referrer: url,
//   });
//   if (res2.status > 300) {
//     console.log("2nd Status code bro:dood");
//     console.log(res2.status);
//     return null;
//   }
//   //Get page content in html
//   let source2 = await res2.text();
//   if (source2.length == 0) {
//     console.log("no second source bro:dood");
//     return null;
//   }
//   let html2 = source.split("\n").join("");

//   let trueUrl = html2 + "zUEJeL3mUN?token=" + md5.split("/").pop();

//   console.log({ trueUrl });

//   return trueUrl;

//   // val trueUrl = app.get(md5, referer = url).text + "zUEJeL3mUN?token=" + md5.substringAfterLast("/")   //direct link to extract  (zUEJeL3mUN is random)
//   // val quality = Regex("\\d{3,4}p").find(response0.substringAfter("<title>").substringBefore("</title>"))?.groupValues?.get(0)
// };
// let upcloud = () => {};
// let vicloud = async (url = "") => {};

async function get(url = "", referer = "", headers_ = {}) {
  if (!url) {
    return null;
  }
  // console.log({ url });
  let res = await fetch(url, {
    referrer: referer,
    headers: {
      ...headers_,
    },
  });

  if (res.status >= 300) {
    return null;
  }

  let doc = await res.text();
  return doc;
}

let cleanHTMLRes = (html = "") => {
  return html.split("\n").join("") ?? "";
};

//========================== UHD MOVIES ===================================

let uhdmoviesAPI = "https://uhdmovies.store";
let invokeUHDMovie = async (title, year, season, lastSeason, episode) => {
  slug = createSlug(title)?.replace("-", " ");
  let url = `${uhdmoviesAPI}/?s=${slug}`;

  let res = await get(url, url, headers);
  let source = cleanHTMLRes(res);

  let scriptData = {};
  cheerio
    .load(source)("div.row.gridlove-posts article")
    .each((i, el) => {
      scriptData[cheerio.load(el)("a:first-child")?.attr("href") ?? ""] =
        cheerio.load(el)("h1:first-child")?.text() ?? "";
    });

  // console.log({ detailUrl: Object.entries(scriptData) });
  // console.log("------------------------------");

  let detailUrl = null;

  if (Object.keys(scriptData).length == 1) {
    detailUrl = Object.keys(scriptData)[0];
  } else {
    detailUrl = Object.entries(scriptData).find((el) => {
      return filterMedia(el[1], title, year, season);
    })
      ? Object.entries(scriptData).find((el) =>
          filterMedia(el[1], title, year, season)
        )[0]
      : null;
  }

  // console.log({ detailUrl });

  if (!detailUrl) {
    return null;
  }

  let detailDoc = await get(detailUrl, detailUrl, headers);
  detailDoc = cleanHTMLRes(detailDoc ?? "");

  if (!detailDoc) {
    return null;
  }
  //
  let $ = cheerio.load(detailDoc);
  let iframeList = $("div.entry-content p")
    ?.toArray()
    .filter((el) => !!el)
    .filter((el) => {
      return filterIframe($(el).text(), title, year, season);
    })
    .map((el) => {
      if (!season) {
        let epDetailHref = cheerio
          .load($(el).next("p").first().html())("a")
          .attr("href");

        return {
          [cheerio.load(el).text()]: epDetailHref,
        };
      }

      let epDetail = $(el)
        .next("p")
        .first()
        .children("a")
        .toArray()
        .find((el) => {
          return cheerio.load(el)("span").text() == `Episode ${episode}`;
        });

      return {
        [`${
          cheerio.load(el).text().length > 50
            ? // ? cheerio.load(el).text().substring(0, 50)
              cheerio.load(el).text()
            : cheerio.load(el).text()
        } ${
          season && episode
            ? "S" +
              season?.toString()?.padStart(2, "0") +
              "E" +
              episode?.toString()?.padStart(2, "0")
            : ""
        }`]: epDetail.attribs["href"],
      };
    })
    .map((el) => {
      return el;
    })
    .filter((el) => {
      return /(https:)|(http:)/.test(Object.values(el)[0] ?? "");
    });

  let vidUrls = await Promise.all(
    iframeList.map((element) => {
      if (element) {
        // console.log({ element });
        return getUrlFromBypass(element);
      }
      return null;
    })
  );

  return vidUrls;
};

let getUrlFromBypass = async (el) => {
  //
  const link = Object.values(el)[0];
  const name = Object.keys(el)[0];

  console.log({ name });
  console.log({ link });

  let driveLink = link.includes("driveleech")
    ? await bypassDriveleech(link)
    : await bypassTechmny(link);

  console.log({ driveLink });

  if (!driveLink) {
    return null;
  }

  // let base = getBaseUrl(driveLink ?? "") ?? null;
  let driveReq = await fetch(driveLink);
  if (driveReq.status > 300) {
    return null;
  }
  let driveRes = (await driveReq?.text())?.split("\n")?.join("");
  let bitlink = cheerio
    .load(driveRes)("a.btn.btn-outline-success")
    .attr("href");

  let insLink = cheerio
    .load(driveRes)("a.btn.btn-danger:contains(Instant Download)")
    .attr("href");

  let downloadLink = null;

  if (insLink) {
    downloadLink = await extractInstantUHD(insLink);
  } else if (
    cheerio
      .load(await driveReq.text())("button.btn.btn-success")
      ?.text()
      ?.includes("Direct Download")
  ) {
    //
    downloadLink = extractDirectUHD(driveLink, driveReq);
  }
  return {
    title: name,
    url: downloadLink,
    name: `UHD ${getQuality(name)}`,
  };
};

//--------------------------------------------------------------------------------------

let filterMedia = (it = "", title = "", year = 0, season = 0) => {
  let fixTitle = createSlug(title).replace(/\+/g, " ");
  // console.log({ fixTitle });

  let ret = null;
  if (season) {
    if (season > 1) {
      ret =
        RegExp(`(Season\\s0?1-0?${season})|(S0?1-S?0?${season})`, "i").test(
          it
        ) && RegExp(`(${fixTitle})|(${title})`, "i").test(it);
    } else {
      ret =
        /(Season\s0?1)|(S0?1)/i.test(it) &&
        RegExp(`(${fixTitle})|(${title})`, "i").test(it);
    }
  } else {
    ret = it.includes(year) && RegExp(`(${fixTitle})|(${title})`, "i").test(it);
  }

  return ret;
};

//--------------------------------------------------------------------------------------

let filterIframe = (it = "", title = "", year = 0, season = 0) => {
  let slug = createSlug(title);
  // console.log({ slug });

  let dotSlug = slug?.replace(/\+/g, ".");
  let spaceSlug = slug?.replace(/\+/g, " ");

  let ret = false;
  if (season) {
    ret =
      RegExp(`(S0?${season})|(Season\\s0?${season})`, "i").test(it) &&
      !it.includes("Download");
  } else {
    ret =
      RegExp(`(${year})|(${dotSlug})|(${spaceSlug})`, "i").test(it) &&
      !it.includes("Download");
  }
  return ret;
};

//--------------------------------------------------------------------------------------

let createSlug = (str = "") => {
  return (
    str
      .replace(/[^\w ]+/, "")
      .replace(/ /g, "+")
      // .replace(/ /g, "-")
      .toLowerCase()
  );
};
//--------------------------------------------------------------------------------------

let extractDirectUHD = async (url = "", nice = new Response()) => {
  if (!url) {
    console.log("No url: " + url);
    return null;
  }

  let document = (await nice.text()).split("\n").join("");
  let script =
    cheerio.load(document)("script:containsData(cf_token)")?.text() ?? null;
  let actionToken = script.split('"key", "').pop().split('");')[0];
  let cfToken = script.split('cf_token = "').pop().split('";')[0];

  //
  // let host = getBaseUrl(url);
  let formBody = new FormData();
  formBody.append("action", "direct");
  formBody.append("key", actionToken);
  formBody.append("action_token", cfToken);

  let cookies = {
    PHPSESSID: `${nice.headers.get("PHPSESSID") ?? ""}`,
  };

  console.log(222222222222222222222222222);
  let res = await axios({
    url,
    method: "POST",
    data: formBody,
    headers: {
      ...headers,
      ...formBody.getHeaders(),
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      "x-token": "driveleech.org",
      Cookie: cookies,
      Referer: url,
    },
  });

  // console.log({ res });

  return res?.data?.url ?? null;
};

//----------------------------------------------------------------------------

let extractInstantUHD = async (url = "") => {
  let host = getBaseUrl(url);
  let formBody = new FormData();
  formBody.append("keys", url.split("url=").pop());

  if (!url) {
    console.log("No url: " + url);
    return null;
  }
  console.log(333333333333333333333333333333333);
  let res = await axios({
    url: `${host}/api`,
    method: "POST",
    data: formBody,
    headers: {
      ...headers,
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      "x-token": new URL(url).host,
      Referer: `${host}/`,
      ...formBody.getHeaders(),
    },
  });

  // console.log({ res });

  return res?.data?.url ?? null;
};

//----------------------------------------------------------------------------

let bypassTechmny = async (url = "") => {
  console.log({ url });
  if (!url) {
    return null;
  }

  let res = await fetch(url);
  if (res.status > 300) {
    console.log(res.status);
    return null;
  }
  console.log("DONE=======================================");
  //Get page content in html
  let source = await res.text();
  if (source.length == 0) {
    console.log("no source bro:dood");
    return null;
  }
  //
  //Get url source
  let techRes = HTMLParser.parse(source.split("\n").join(""));
  let postUrl = url.split("?id=")[0].split("/?").pop();
  //
  let goUrl = "";
  let goHeader = "";
  //
  if (techRes.querySelector("form#landing input[name=_wp_http_c]")) {
    console.log(444444444444444444444444444444444444444);
    let res = await fetch(url, {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        _wp_http_c: url.split("?id=")[-1],
      }),
    });
    let resText = await res.text();

    //------------------------------------------------------------------------
    let { longC, catC, _ } = await getTechmnyCookies(resText);
    let headers = {
      Cookie: `${longC}; ${catC}`,
    };
    var formlink =
      HTMLParser.parse(resText).querySelector("center a")?.attributes["href"];
    //
    res = await fetch(formlink, {
      headers: headers,
    });
    if (res.status > 300) {
      return null;
    }
    let source = await res.text();
    if (source.length == 0) {
      return null;
    }
    source = source.split("\n").join("");

    //------------------------------------------------------------------------

    let { longC2, __, postC } = await getTechmnyCookies(source);
    headers = {
      Cookie: `${catC}; ${longC2}; ${postC}`,
    };
    formlink =
      HTMLParser.parse(source).querySelector("center a")?.attributes["href"];

    res = await fetch(formlink, {
      headers: headers,
    });
    if (res.status > 300) {
      return null;
    }
    source = await res.text();
    if (source.length == 0) {
      return null;
    }
    source = source.split("\n").join("");
    //------------------------------------------------------------------------

    let goToken = source.split("?go=").pop().split('"')[0];
    let tokenUrl = `${postUrl}?go=${goToken}`;
    let newLongC = `${goToken}` + "";
    headers = {
      Cookie: `${catC}; rdst_post=; ${newLongC}`,
    };

    goUrl = tokenUrl;
    goHeader = headers;
  } else {
    console.log("heeeere in the else");
    let secondPage = await getNextPage(techRes.toString());
    let thirdPage = await getNextPage(secondPage);
    let goToken = thirdPage?.split("?go=")?.pop()?.split('"')[0];
    let tokenUrl = `${postUrl}?go=${goToken}`;
    let headers = {
      Cookie: `${goToken}=${
        cheerio
          .load(secondPage)("form#landing input[name=_wp_http2]")
          .attr("value") ?? ""
      }`,
    };
    goUrl = tokenUrl;
    goHeader = headers;
  }
  //
  //drive leech
  res = await fetch(goUrl, {
    headers: goHeader,
  });
  if (res.status > 300) {
    return null;
  }
  //Get page content in html
  source = await res.text();
  source = source.split("\n").join("");
  if (source.length == 0) {
    // console.log("no source bro:dood");
    return null;
  }
  let driveUrl = HTMLParser.parse(source)
    .querySelector("meta[http-equiv=refresh]")
    .attrs["content"]?.split("url=")
    .pop();

  let realUrl = bypassDriveleech(driveUrl, headers);

  return realUrl ?? null;
};
//
//--------------------------------------------------------------------------------------

let getNextPage = async (document = "") => {
  let $ = cheerio.load(document);
  let body = {};
  let url = $("form").attr("action") ?? "";

  $("form input").map((i, el) => {
    body[el.attribs["name"]] = el.attribs["value"];
  });

  const formBody = new FormData();
  for (const key of Object.keys(body)) {
    formBody.append(key, body[key]);
  }

  // console.log({ body });
  // console.log({ url });

  if (!url) {
    console.log("No url: " + url);
    return null;
  }
  console.log(1111111111111111111111111111);

  let res = await axios({
    url,
    method: "POST",
    data: formBody,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (res.status > 300) {
    return null;
  }
  // //
  // //Get page content in html
  // let source = await res.data;
  let source = await res.data;
  // console.log(source);

  if (source.length == 0) {
    return null;
  }
  source = source.split("\n").join("");
  // console.log(source);

  return source;
};
//--------------------------------------------------------------------------------------

async function bypassDriveleech(url) {
  if (!url) {
    return null;
  }
  let res = await fetch(url, {
    headers: headers,
  });
  if (res.status > 300) {
    return null;
  }
  //Get page content in html
  let source = await res.text();
  if (source.length == 0) {
    // console.log("no source bro:dood");
    return null;
  }
  let path = source.split('replace("').pop().split('")')[0];
  if (path == "/404") return null;
  return fixUrl(path, getBaseUrl(url));
}

//--------------------------------------------------------------------------------------

function getBaseUrl(url = "") {
  console.log({ url });
  return new URL(url).origin ?? "";
}
//--------------------------------------------------------------------------------------

function fixUrl(url = "", domain = "") {
  if (url.startsWith("http")) {
    return url;
  }

  if (!url.length) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  } else {
    if (url.startsWith("/")) {
      return domain + url;
    }

    return `${domain}/${url}`;
  }
}
//--------------------------------------------------------------------------------------

let getTechmnyCookies = async (page = "") => {
  let cat = "rdst_cat";
  let post = "rdst_post";
  let longC = page
    .split(".setTime")
    .pop()
    .split('document.cookie = "')
    .pop('"')
    .split(".setTime")[0]
    .split(";")[0];
  let catC = "";
  if (page.includes(`${cat}=`)) {
    let it = page.split(`${cat}=`).pop().split(";")[0];
    catC = `${cat}=${it}`;
  }
  let postC = "";
  if (page.includes(`${post}=`)) {
    let it = page.split(`${post}=`).pop().split(";")[0];
    postC = `${post}=${it}`;
  }

  return { longC, catC, postC };
};
//--------------------------------------------------------------------------------------

// (async () => {
//   await invokeUHDMovie();
// })();

module.exports = { voe, upstream, mixdrop, invokeUHDMovie };
