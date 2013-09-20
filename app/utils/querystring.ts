module querystring {
  // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
  export function parse(query: string): {[key: string]:string;} {
    var pl = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = (s: string) => { return decodeURIComponent(s.replace(pl, ' ')); };

    var urlParams: {[key: string]:string;} = {};
    var match: RegExpExecArray;
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  }
}

export = querystring;
