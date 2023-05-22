package main

import (
	"fmt"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"GMVivWiki/markup"
	"GMVivWiki/search"
	"GMVivWiki/utils"
)

func NewHandler(webroot string) func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	return func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		urlpath := r.URL.Path
		query := r.URL.Query()
		if urlpath == "/search" {
			handleSearch(w, query)
			return
		}

		realpath := path.Join(webroot, urlpath)

		fi, err := os.Stat(realpath)
		if err != nil {
			io.WriteString(w, err.Error())
			return
		}

		lang := "en"
		if _, found := query["lang"]; found {
			lang = query["lang"][0]
		}

		if fi.IsDir() {
			if _, found := query["browse"]; found {
				handleBrowse(w, realpath, urlpath)
			} else {
				content, err := getIndexContent(realpath, urlpath)
				if err != nil {
					io.WriteString(w, err.Error())
					return
				}
				handleContent(w, lang, path.Base(realpath), content)
			}
			return
		}

		if _, found := query["pdf"]; found && mainConfig.SupportExportPDF {
			withTOC := false
			if _, found := query["toc"]; found {
				if query["toc"][0] == "y" {
					withTOC = true
				}
			}
			pdfFile, err := generatePdf(realpath, lang, withTOC)
			if err != nil {
				io.WriteString(w, err.Error())
				return
			}
			defer removeTmpFiles(pdfFile)
			http.ServeFile(w, r, pdfFile)
			return
		}

		if strings.HasSuffix(fi.Name(), ".md") {
			contentBytes, err := os.ReadFile(realpath)
			if err != nil {
				fmt.Fprintf(w, "read file %v error: %v", realpath, err)
				return
			}
			handleContent(w, lang, path.Base(realpath), string(contentBytes))
		} else {
			http.ServeFile(w, r, realpath)
		}
	}
}

func handleSearch(w http.ResponseWriter, query url.Values) {
	t, err := template.ParseFiles("template/html/search.html")
	if err != nil {
		io.WriteString(w, err.Error())
		return
	}
	_, found := query["keyword"]
	if !found {
		io.WriteString(w, "no keyword found")
		return
	}
	resultList, err := search.SearchRegexp(mainConfig.WebRoot, query["keyword"][0])
	if err != nil {
		io.WriteString(w, err.Error())
		return
	}
	t.Execute(w, resultList)
}

func handleBrowse(w http.ResponseWriter, realpath, urlpath string) {
	t, err := template.ParseFiles("template/html/browse.html")
	if err != nil {
		io.WriteString(w, err.Error())
		return
	}
	content, err := getBrowseList(realpath, urlpath)
	if err != nil {
		io.WriteString(w, err.Error())
		return
	}
	c := struct {
		Title   string
		Content template.HTML
	}{
		Title:   urlpath,
		Content: template.HTML(content),
	}
	t.Execute(w, c)
}

func handleContent(w http.ResponseWriter, lang, title, content string) {
	toc, body := markup.ConvertMd2Html(content)

	tpFile := "template/html/markdown.html"
	tp, err := template.ParseFiles(tpFile)
	if err != nil {
		fmt.Fprintf(w, "parse template %v error: %v", tpFile, err)
		return
	}
	c := struct {
		Lang  string
		Title string
		TOC   template.HTML
		Body  template.HTML
	}{
		Lang:  lang,
		Title: title,
		TOC:   template.HTML(toc),
		Body:  template.HTML(body),
	}
	tp.Execute(w, c)
}

func checkAccessAllowed(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	urlpath := r.URL.Path
	for _, v := range publicList {
		if v.MatchString(urlpath) {
			next(w, r)
			return
		}
	}
	realip := utils.GetIPFromRequest(r).String()
	for _, v := range allowList {
		if v.MatchString(realip) {
			next(w, r)
			return
		}
	}
	io.WriteString(w, "Access denied!\nYour ip is "+realip+"\n")
}

func checkPathInWebRoot(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	urlpath := r.URL.Path
	realpath := path.Join(mainConfig.WebRoot, urlpath)
	rel, err := filepath.Rel(mainConfig.WebRoot, realpath)
	if err != nil {
		io.WriteString(w, err.Error())
		return
	}
	if strings.Contains(rel, "..") {
		io.WriteString(w, "Access denied!\nPath out of web root.")
		return
	}
	next(w, r)
}
