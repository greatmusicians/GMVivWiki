package main

import (
	"fmt"
	"html"
	"os"
	"path"
	"strings"
)

func genLinkExtra(urlpath string, isDir bool) string {
	if isDir {
		return fmt.Sprintf(`<a class="a-extra" target="_blank" href="%v?browse">browse</a>`,
			html.EscapeString(urlpath))
	}
	if mainConfig.SupportExportPDF {
		return fmt.Sprintf(`<a class="a-extra" target="_blank" href="%v?pdf&toc=n&lang=de&toc=y&lang=en&readme=相同参数，比如2个toc，则前面的有效">pdf</a>`,
			html.EscapeString(urlpath))
	}
	return ""
}

func genLinkIndex(name, urlpath string, isDir bool) string {
	tCard := `<div class="card"
style="min-width: 400px; background-color:rgba(0,0,0,0); display: inline-block; border: 0;"
>
<div class="card-body" style="padding: 5px 5px 5px 30px">%v</div>
</div>`
	tLinkMain := `<a class="index-link" href="%v?lang=de">%v</a> `
	showName := TemplateExecuteReplacer.Replace(name)
	if isDir {
		link := fmt.Sprintf(tLinkMain, html.EscapeString(urlpath), showName)
		link += genLinkExtra(urlpath, isDir)
		return fmt.Sprintf(tCard, link)
	}
	if name == "favicon.ico" {
		return ""
	}
	link := fmt.Sprintf(tLinkMain, html.EscapeString(urlpath), showName)
	if strings.HasSuffix(name, ".md") {
		link += genLinkExtra(urlpath, isDir)
	}
	return fmt.Sprintf(tCard, link)
}

func genLinkBrowse(name, urlpath string, isDir bool) string {
	if isDir {
		return fmt.Sprintf("<li><a href=\"%v\">[D] %v</a> %v</li>\n",
			html.EscapeString(urlpath),
			TemplateExecuteReplacer.Replace(name),
			genLinkExtra(urlpath, isDir))
	}
	if name == "favicon.ico" {
		return ""
	}
	return fmt.Sprintf("<li><a href=\"%v?lang=de\">[F] %v</a> %v</li>\n",
		html.EscapeString(urlpath),
		TemplateExecuteReplacer.Replace(name),
		genLinkExtra(urlpath, isDir))
}

func getBrowseList(realpath, pathprefix string) (string, error) {
	entryList, err := GetSortedEntryList(realpath)
	if err != nil {
		return "", err
	}
	var directorylist, filelist []string
	for _, v := range entryList {
		if v.IsDir() {
			directorylist = append(directorylist,
				genLinkBrowse(v.Name(), path.Join(pathprefix, v.Name()), v.IsDir()))
		}
	}
	for _, v := range entryList {
		if !v.IsDir() {
			filelist = append(filelist,
				genLinkBrowse(v.Name(), path.Join(pathprefix, v.Name()), v.IsDir()))
		}
	}
	return strings.Join(directorylist, "") + strings.Join(filelist, ""), nil
}

func getIndexContent(realpath, urlpath string) (string, error) {
	indexfile := path.Join(realpath, "index.md")
	_, err := os.Stat(indexfile)
	if err == nil {
		contentBytes, err := os.ReadFile(indexfile)
		if err != nil {
			return "", err
		}
		return string(contentBytes), nil
	}

	content := ``
	entryList, err := GetSortedEntryList(realpath)
	if err != nil {
		return "", err
	}

	addHeader := false
	for _, v1 := range entryList {
		if IsDir(realpath, v1) {
			continue
		}
		if !addHeader {
			content += "# .\n"
			addHeader = true
		}
		content += genLinkIndex(
			v1.Name(), path.Join(urlpath, v1.Name()), v1.IsDir())
	}

	for _, v1 := range entryList {
		if !IsDir(realpath, v1) {
			continue
		}
		content += fmt.Sprintf("\n# %v\n", v1.Name())
		content += genLinkIndex(v1.Name(), path.Join(urlpath, v1.Name()), true)
		el, err := GetSortedEntryList(path.Join(realpath, v1.Name()))
		if err != nil {
			return "", err
		}
		for _, v2 := range el {
			content += genLinkIndex(v2.Name(),
				path.Join(urlpath, v1.Name(), v2.Name()), v2.IsDir())
		}
	}

	return content, nil
}
