package markup

import "github.com/gomarkdown/markdown/ast"

func parseHeading(node ast.Node) []*ast.Heading {
	var result []*ast.Heading
	if heading, ok := node.(*ast.Heading); ok {
		result = append(result, heading)
	}
	container := node.AsContainer()
	if container != nil {
		for _, v := range node.GetChildren() {
			result = append(result, parseHeading(v)...)
		}
	}
	return result
}

func BuildTOC(doc ast.Node) TOC {
	var toc TOC
	for _, v := range parseHeading(doc) {
		s := toc.NewSection(v.Level)
		leaf := v.GetChildren()[0].AsLeaf()
		toc.Add(string(leaf.Literal), s, false)
		v.HeadingID = "sec-" + s.String()
		leaf.Literal = append([]byte(s.String()+" "), leaf.Literal...)
	}
	return toc
}
