package markup

import (
	"regexp"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/ast"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

// return TOC, body
func ConvertMd2Html1(content string) (string, string) {
	if strings.Contains(content, "\r") {
		content = convertCRLF2LF1(content)
	}

	extensions := parser.CommonExtensions
	p := parser.NewWithExtensions(extensions)
	//p.Opts.ParserHook = parserHook
	doc := p.Parse([]byte(content))

	toc := BuildTOC(doc)

	opts := html.RendererOptions{
		Flags: html.CommonFlags,
		//RenderNodeHook: renderHook,
	}
	renderer := html.NewRenderer(opts)
	body := markdown.Render(doc, renderer)

	return toc.HTML(), string(body)
}

func alignTableCenter1(body []string) []string {
	for i, v := range body {
		v = strings.ReplaceAll(v, "<table>",
			`<div class="div-table" style="text-align: center;">
<table style="margin: auto">`)
		body[i] = strings.ReplaceAll(v, "</table>", "</table>\n</div>")
	}
	return body
}

/*
默认的标题
<h1>Er hieß</h1>
*/
func modifyAst(doc ast.Node) ast.Node {
	ast.WalkFunc(doc, func(node ast.Node, entering bool) ast.WalkStatus {
		if img, ok := node.(*ast.Image); ok && entering {
			attr := img.Attribute
			if attr == nil {
				attr = &ast.Attribute{}
			}
			// TODO: might be duplicate
			attr.Classes = append(attr.Classes, []byte("blog-img"))
			img.Attribute = attr
		}

		if link, ok := node.(*ast.Link); ok && entering {
			isExternalURI := func(uri string) bool {
				return (strings.HasPrefix(uri, "https://") || strings.HasPrefix(uri, "http://")) && !strings.Contains(uri, "blog.kowalczyk.info")
			}
			if isExternalURI(string(link.Destination)) {
				link.AdditionalAttributes = append(link.AdditionalAttributes, `target="_blank"`)
			}
		}

		return ast.GoToNext
	})
	return doc
}

/*
<thead>
<tr>
<th></th>
<th></th>
</tr>
</thead>
*/
func removeEmptyThead1(body []string) []string {
	regNotEmpty := regexp.MustCompile(`<th>.+</th>`)
	for i, v := range body {
		if !strings.Contains(v, "thead") {
			continue
		}
		var newV, thead []string
		isEmpty := true
		inThead := false
		for _, line := range strings.Split(v, "\n") {
			if line == "<thead>" {
				thead = append(thead, line)
				inThead = true
				continue
			}
			if line == "</thead>" {
				thead = append(thead, line)
				inThead = false
				if !isEmpty {
					newV = append(newV, thead...)
				}
				thead = nil
				continue
			}
			if inThead {
				if regNotEmpty.MatchString(line) {
					isEmpty = false
				}
				thead = append(thead, line)
				continue
			}
			newV = append(newV, line)
		}
		body[i] = strings.Join(newV, "\n")
	}
	return body
}

func convertCRLF2LF1(content string) string {
	var b strings.Builder
	var crlf string
	for _, v := range content {
		if v == '\r' || v == '\n' {
			crlf += string(v)
		} else {
			if len(crlf) > 0 {
				crlf = strings.ReplaceAll(crlf, "\r\n", "\n")
				crlf = strings.ReplaceAll(crlf, "\r", "\n")
				b.WriteString(crlf)
				crlf = ""
			}
			b.WriteRune(v)
		}
	}
	return b.String()
}
