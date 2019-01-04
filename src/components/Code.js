import React from 'react';
import { Controlled as ReactCodeMirror2 } from 'react-codemirror2';
import CodeMirror from 'codemirror';
import debounce from 'lodash.debounce';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import ReactCodeMirror from 'react-codemirror';
import './Code.less';
import 'codemirror/mode/go/go';
import 'codemirror/mode/javascript/javascript';

var codes = {
  go: '// Copyright 2009 The Go Authors. All rights reserved.\n// Use of this source code is governed by a BSD-style\n// license that can be found in the LICENSE file.\n\npackage http\n\nimport (\n    "log"\n    "net"\n    "strconv"\n    "strings"\n    "time"\n)\n\n// A Cookie represents an HTTP cookie as sent in the Set-Cookie header of an\n// HTTP response or the Cookie header of an HTTP request.\n//\n// See https://tools.ietf.org/html/rfc6265 for details.\ntype Cookie struct {\n    Name  string\n    Value string\n\n    Path       string    // optional\n    Domain     string    // optional\n    Expires    time.Time // optional\n    RawExpires string    // for reading cookies only\n\n    // MaxAge=0 means no \'Max-Age\' attribute specified.\n    // MaxAge<0 means delete cookie now, equivalently \'Max-Age: 0\'\n    // MaxAge>0 means Max-Age attribute present and given in seconds\n    MaxAge   int\n    Secure   bool\n    HttpOnly bool\n    SameSite SameSite\n    Raw      string\n    Unparsed []string // Raw text of unparsed attribute-value pairs\n}\n\n// SameSite allows a server define a cookie attribute making it impossible to\n// the browser send this cookie along with cross-site requests. The main goal\n// is mitigate the risk of cross-origin information leakage, and provides some\n// protection against cross-site request forgery attacks.\n//\n// See https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00 for details.\ntype SameSite int\n\nconst (\n    SameSiteDefaultMode SameSite = iota + 1\n    SameSiteLaxMode\n    SameSiteStrictMode\n)\n\n// readSetCookies parses all "Set-Cookie" values from\n// the header h and returns the successfully parsed Cookies.\nfunc readSetCookies(h Header) []*Cookie {\n    cookieCount := len(h["Set-Cookie"])\n    if cookieCount == 0 {\n        return []*Cookie{}\n    }\n    cookies := make([]*Cookie, 0, cookieCount)\n    for _, line := range h["Set-Cookie"] {\n        parts := strings.Split(strings.TrimSpace(line), ";")\n        if len(parts) == 1 && parts[0] == "" {\n            continue\n        }\n        parts[0] = strings.TrimSpace(parts[0])\n        j := strings.Index(parts[0], "=")\n        if j < 0 {\n            continue\n        }\n        name, value := parts[0][:j], parts[0][j+1:]\n        if !isCookieNameValid(name) {\n            continue\n        }\n        value, ok := parseCookieValue(value, true)\n        if !ok {\n            continue\n        }\n        c := &Cookie{\n            Name:  name,\n            Value: value,\n            Raw:   line,\n        }\n        for i := 1; i < len(parts); i++ {\n            parts[i] = strings.TrimSpace(parts[i])\n            if len(parts[i]) == 0 {\n                continue\n            }\n\n            attr, val := parts[i], ""\n            if j := strings.Index(attr, "="); j >= 0 {\n                attr, val = attr[:j], attr[j+1:]\n            }\n            lowerAttr := strings.ToLower(attr)\n            val, ok = parseCookieValue(val, false)\n            if !ok {\n                c.Unparsed = append(c.Unparsed, parts[i])\n                continue\n            }\n            switch lowerAttr {\n            case "samesite":\n                lowerVal := strings.ToLower(val)\n                switch lowerVal {\n                case "lax":\n                    c.SameSite = SameSiteLaxMode\n                case "strict":\n                    c.SameSite = SameSiteStrictMode\n                default:\n                    c.SameSite = SameSiteDefaultMode\n                }\n                continue\n            case "secure":\n                c.Secure = true\n                continue\n            case "httponly":\n                c.HttpOnly = true\n                continue\n            case "domain":\n                c.Domain = val\n                continue\n            case "max-age":\n                secs, err := strconv.Atoi(val)\n                if err != nil || secs != 0 && val[0] == \'0\' {\n                    break\n                }\n                if secs <= 0 {\n                    secs = -1\n                }\n                c.MaxAge = secs\n                continue\n            case "expires":\n                c.RawExpires = val\n                exptime, err := time.Parse(time.RFC1123, val)\n                if err != nil {\n                    exptime, err = time.Parse("Mon, 02-Jan-2006 15:04:05 MST", val)\n                    if err != nil {\n                        c.Expires = time.Time{}\n                        break\n                    }\n                }\n                c.Expires = exptime.UTC()\n                continue\n            case "path":\n                c.Path = val\n                continue\n            }\n            c.Unparsed = append(c.Unparsed, parts[i])\n        }\n        cookies = append(cookies, c)\n    }\n    return cookies\n}\n\n// SetCookie adds a Set-Cookie header to the provided ResponseWriter\'s headers.\n// The provided cookie must have a valid Name. Invalid cookies may be\n// silently dropped.\nfunc SetCookie(w ResponseWriter, cookie *Cookie) {\n    if v := cookie.String(); v != "" {\n        w.Header().Add("Set-Cookie", v)\n    }\n}\n\n// String returns the serialization of the cookie for use in a Cookie\n// header (if only Name and Value are set) or a Set-Cookie response\n// header (if other fields are set).\n// If c is nil or c.Name is invalid, the empty string is returned.\nfunc (c *Cookie) String() string {\n    if c == nil || !isCookieNameValid(c.Name) {\n        return ""\n    }\n    var b strings.Builder\n    b.WriteString(sanitizeCookieName(c.Name))\n    b.WriteRune(\'=\')\n    b.WriteString(sanitizeCookieValue(c.Value))\n\n    if len(c.Path) > 0 {\n        b.WriteString("; Path=")\n        b.WriteString(sanitizeCookiePath(c.Path))\n    }\n    if len(c.Domain) > 0 {\n        if validCookieDomain(c.Domain) {\n            // A c.Domain containing illegal characters is not\n            // sanitized but simply dropped which turns the cookie\n            // into a host-only cookie. A leading dot is okay\n            // but won\'t be sent.\n            d := c.Domain\n            if d[0] == \'.\' {\n                d = d[1:]\n            }\n            b.WriteString("; Domain=")\n            b.WriteString(d)\n        } else {\n            log.Printf("net/http: invalid Cookie.Domain %q; dropping domain attribute", c.Domain)\n        }\n    }\n    var buf [len(TimeFormat)]byte\n    if validCookieExpires(c.Expires) {\n        b.WriteString("; Expires=")\n        b.Write(c.Expires.UTC().AppendFormat(buf[:0], TimeFormat))\n    }\n    if c.MaxAge > 0 {\n        b.WriteString("; Max-Age=")\n        b.Write(strconv.AppendInt(buf[:0], int64(c.MaxAge), 10))\n    } else if c.MaxAge < 0 {\n        b.WriteString("; Max-Age=0")\n    }\n    if c.HttpOnly {\n        b.WriteString("; HttpOnly")\n    }\n    if c.Secure {\n        b.WriteString("; Secure")\n    }\n    switch c.SameSite {\n    case SameSiteDefaultMode:\n        b.WriteString("; SameSite")\n    case SameSiteLaxMode:\n        b.WriteString("; SameSite=Lax")\n    case SameSiteStrictMode:\n        b.WriteString("; SameSite=Strict")\n    }\n    return b.String()\n}\n\n// readCookies parses all "Cookie" values from the header h and\n// returns the successfully parsed Cookies.\n//\n// if filter isn\'t empty, only cookies of that name are returned\nfunc readCookies(h Header, filter string) []*Cookie {\n    lines, ok := h["Cookie"]\n    if !ok {\n        return []*Cookie{}\n    }\n\n    cookies := []*Cookie{}\n    for _, line := range lines {\n        parts := strings.Split(strings.TrimSpace(line), ";")\n        if len(parts) == 1 && parts[0] == "" {\n            continue\n        }\n        // Per-line attributes\n        for i := 0; i < len(parts); i++ {\n            parts[i] = strings.TrimSpace(parts[i])\n            if len(parts[i]) == 0 {\n                continue\n            }\n            name, val := parts[i], ""\n            if j := strings.Index(name, "="); j >= 0 {\n                name, val = name[:j], name[j+1:]\n            }\n            if !isCookieNameValid(name) {\n                continue\n            }\n            if filter != "" && filter != name {\n                continue\n            }\n            val, ok := parseCookieValue(val, true)\n            if !ok {\n                continue\n            }\n            cookies = append(cookies, &Cookie{Name: name, Value: val})\n        }\n    }\n    return cookies\n}\n\n// validCookieDomain returns whether v is a valid cookie domain-value.\nfunc validCookieDomain(v string) bool {\n    if isCookieDomainName(v) {\n        return true\n    }\n    if net.ParseIP(v) != nil && !strings.Contains(v, ":") {\n        return true\n    }\n    return false\n}\n\n// validCookieExpires returns whether v is a valid cookie expires-value.\nfunc validCookieExpires(t time.Time) bool {\n    // IETF RFC 6265 Section 5.1.1.5, the year must not be less than 1601\n    return t.Year() >= 1601\n}\n\n// isCookieDomainName returns whether s is a valid domain name or a valid\n// domain name with a leading dot \'.\'.  It is almost a direct copy of\n// package net\'s isDomainName.\nfunc isCookieDomainName(s string) bool {\n    if len(s) == 0 {\n        return false\n    }\n    if len(s) > 255 {\n        return false\n    }\n\n    if s[0] == \'.\' {\n        // A cookie a domain attribute may start with a leading dot.\n        s = s[1:]\n    }\n    last := byte(\'.\')\n    ok := false // Ok once we\'ve seen a letter.\n    partlen := 0\n    for i := 0; i < len(s); i++ {\n        c := s[i]\n        switch {\n        default:\n            return false\n        case \'a\' <= c && c <= \'z\' || \'A\' <= c && c <= \'Z\':\n            // No \'_\' allowed here (in contrast to package net).\n            ok = true\n            partlen++\n        case \'0\' <= c && c <= \'9\':\n            // fine\n            partlen++\n        case c == \'-\':\n            // Byte before dash cannot be dot.\n            if last == \'.\' {\n                return false\n            }\n            partlen++\n        case c == \'.\':\n            // Byte before dot cannot be dot, dash.\n            if last == \'.\' || last == \'-\' {\n                return false\n            }\n            if partlen > 63 || partlen == 0 {\n                return false\n            }\n            partlen = 0\n        }\n        last = c\n    }\n    if last == \'-\' || partlen > 63 {\n        return false\n    }\n\n    return ok\n}\n\nvar cookieNameSanitizer = strings.NewReplacer("\n", "-", "\r", "-")\n\nfunc sanitizeCookieName(n string) string {\n    return cookieNameSanitizer.Replace(n)\n}\n\n// https://tools.ietf.org/html/rfc6265#section-4.1.1\n// cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )\n// cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E\n//           ; US-ASCII characters excluding CTLs,\n//           ; whitespace DQUOTE, comma, semicolon,\n//           ; and backslash\n// We loosen this as spaces and commas are common in cookie values\n// but we produce a quoted cookie-value in when value starts or ends\n// with a comma or space.\n// See https://golang.org/issue/7243 for the discussion.\nfunc sanitizeCookieValue(v string) string {\n    v = sanitizeOrWarn("Cookie.Value", validCookieValueByte, v)\n    if len(v) == 0 {\n        return v\n    }',
  javascript: 'class Welcome extends React.Component {\n  render() {\n    return <h1>Hello, {this.props.name}</h1>;\n  }\n}',
};

const modes = {
  go: 'go',
  javascript: 'javascript',
}

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: codes.go,
      readOnly: true,
      mode: modes.go
    };
  };
  toggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly,
    });
  };
  changeMode = (e) => {
    const mode = e.target.value;
    this.setState({
      ...this.state,
      mode,
      code: codes[mode],
    });
  }
  onCodeChange = (editor, data, value) => {
    console.warn(data);
  }
  onCodeBeforeChange = (editor, data, value) => {
    this.setState({
      code: value
    });
  }
  onCodeSelection = (editor, data) => {
    if (data.ranges && data.ranges.length > 0) {
      const from = data.ranges[0].from();
      const to = data.ranges[0].to();
      console.warn(`select from line ${from.line} ch ${from.ch} to line ${to.line} ch ${to.ch}`);
      if (from.line === to.line && from.ch === to.ch) {
        return
      }
      this.addWidget(editor, from, to);
      let text = '';
      for (let i = from.line; i <= to.line; i++) {
        text += editor.getLineTokens(i).reduce((aac, token) => aac + token.string, '') + '\n';
        if (i === from.line) {
          editor.addLineClass(i, 'background', 'reader-code-selected');
        } else if (i === to.line) {
          if (i !== 0) {
            editor.addLineClass(i, 'background', 'reader-code-selected');
          }
        } else {
          editor.addLineClass(i, 'background', 'reader-code-selected');
        }
      }
      console.warn(text);
      editor.foldCode(CodeMirror.Pos(from.line, from.ch));
    }
  }
  addWidget(editor, from, to) {
    const msg = document.createElement('span');
    let text = document.createTextNode(`line:${from.line} ch:${from.ch} - line:${to.line} ch:${to.ch}`);
    text.onclick="this.contentEditable='true';";
    msg.appendChild(text);
    msg.className="reader-code-widget-point-tag";
    const widget = editor.addLineWidget(from.line, msg, { coverGutter: false, noHScroll: true, above: true}); 
    setTimeout(() => widget.clear(), 2000);
  }
  onCodeScroll = (editor, data) => {
    const rect = editor.getWrapperElement().getBoundingClientRect();
    const topVisibleLine = editor.lineAtHeight(rect.top, "window");
    const bottomVisibleLine = editor.lineAtHeight(rect.bottom, "window");
    console.warn('top visible line:', topVisibleLine, 'bottom visible line', bottomVisibleLine);
  }
  render() {
    const { readOnly, mode, code } = this.state;
    const options = {
      lineNumbers: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      readOnly,
      mode,
    };
    return (
      <div>
        <ReactCodeMirror2 
          value={code}
          options={options}
          onChange={this.onCodeChange}
          onBeforeChange={this.onCodeBeforeChange}
          onSelection={debounce(this.onCodeSelection, 400)}
          onScroll={debounce(this.onCodeScroll, 400)}
        />
        <div style={{ marginTop: 10 }}>
          <select onChange={this.changeMode} value={mode}>
            <option value={modes.go}>{modes.go}</option>
            <option value={modes.javascript}>{modes.javascript}</option>
          </select> 
        </div>
        <button onClick={this.toggleReadOnly}>Toggle read-only mode (currently {this.state.readOnly ? 'on' : 'off' })</button>
      </div>
    );
  };
};

export default Code;

