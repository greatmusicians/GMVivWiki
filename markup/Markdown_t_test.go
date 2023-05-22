package markup_test

import (
	"GMVivWiki/markup"
	"fmt"
	"testing"

	"github.com/gomarkdown/markdown/parser"
)

const md = `
# H1
content
## H1-1
content
## H1-2
content
# H2
### H2-1-1
content
# H3
`

func TestTOC(T *testing.T) {
	extensions := parser.CommonExtensions
	p := parser.NewWithExtensions(extensions)
	//p.Opts.ParserHook = parserHook
	doc := p.Parse([]byte(md))

	toc := markup.BuildTOC(doc)
	fmt.Println(toc.HTML())
}
