package markup

import (
	"io"

	"github.com/gomarkdown/markdown/ast"
)

func renderTable(w io.Writer, p *ast.Paragraph, entering bool) {
	if entering {
		io.WriteString(w, "<div>")
	} else {
		io.WriteString(w, "</div>")
	}
}

func RenderTableHook(w io.Writer, node ast.Node, entering bool) (ast.WalkStatus, bool) {
	if para, ok := node.(*ast.Paragraph); ok {
		renderTable(w, para, entering)
		return ast.GoToNext, true
	}
	return ast.GoToNext, false
}
