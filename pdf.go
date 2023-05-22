package main

import (
	"bytes"
	"context"
	"html/template"
	"os"
	"path"
	"path/filepath"

	"GMVivWiki/markup"
	"GMVivWiki/utils"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"

	"github.com/pborman/uuid"
)

func generatePdf(mdfile, lang string, withTOC bool) (string, error) {
	uuid := uuid.New()
	htmlFile, err := generateTmpFileHtml(mdfile, uuid, lang, withTOC)
	if err != nil {
		return "", err
	}
	return generateTmpFilePdf(htmlFile, uuid)
}

func writeTmpHtml(uuid string, data []byte) (string, error) {
	basepath, err := utils.GetExecutableFullpath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(path.Join(basepath, "tmppdf", uuid), 0755)
	if err != nil {
		return "", err
	}
	filename := path.Join(basepath, "tmppdf", uuid, "tmp.html")
	return filename, os.WriteFile(filename, data, 0644)
}

func writeTmpPdf(uuid string, data []byte) (string, error) {
	basepath, err := utils.GetExecutableFullpath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(path.Join(basepath, "tmppdf", uuid), 0755)
	if err != nil {
		return "", err
	}
	filename := path.Join(basepath, "tmppdf", uuid, "tmp.pdf")
	return filename, os.WriteFile(filename, data, 0644)
}

func removeTmpFiles(pdfFile string) {
	os.RemoveAll(path.Dir(pdfFile))
}

func generateTmpFileHtml(mdfile, uuid, lang string, withTOC bool) (string, error) {
	contentBytes, err := os.ReadFile(mdfile)
	if err != nil {
		return "", err
	}
	toc, body := markup.ConvertMd2Html(string(contentBytes))
	if !withTOC {
		toc = ""
	}

	basepath, err := utils.GetExecutableFullpath()
	if err != nil {
		return "", err
	}

	tmpl, err := template.ParseFiles("template/html/pdf.html")
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	tmpl.Execute(buf, struct {
		Lang     string
		BasePath template.URL
		TOC      template.HTML
		Body     template.HTML
	}{
		Lang:     lang,
		BasePath: template.URL(filepath.ToSlash(basepath)),
		TOC:      template.HTML(toc),
		Body:     template.HTML(body),
	})

	return writeTmpHtml(uuid, buf.Bytes())
}

func generateTmpFilePdf(htmlFile, uuid string) (string, error) {
	ctx, cancel := chromedp.NewExecAllocator(
		context.Background(),
		//chromedp.Headless,
		chromedp.UserDataDir("chrome_userdatadir"),
	)
	defer cancel()
	ctx, cancel = chromedp.NewContext(ctx)
	defer cancel()

	err := chromedp.Run(ctx, chromedp.Navigate("file://"+htmlFile))
	if err != nil {
		return "", err
	}

	var renderInfo string
	for {
		err := chromedp.Run(ctx, chromedp.InnerHTML(`#complete`, &renderInfo, chromedp.ByID))
		if err != nil {
			return "", err
		}
		if renderInfo == "complete" {
			break
		}
	}

	var pdfBytes []byte
	err = chromedp.Run(ctx,
		chromedp.ActionFunc(
			func(ctx context.Context) error {
				// 设置打印参数，A4=8.27*11.69inch
				param := &page.PrintToPDFParams{
					PrintBackground: true,
					PaperWidth:      8.27,
					PaperHeight:     11.69,
					MarginTop:       0.3,
					MarginRight:     0,
					MarginBottom:    0.3,
					MarginLeft:      0,
				}

				// 获取pdf字节数组
				pdfTmpBytes, _, err := param.Do(ctx)
				if err != nil {
					return err
				}

				// 将pdf字节数组赋值给对应指针
				pdfBytes = pdfTmpBytes
				return nil
			}),
	)
	if err != nil {
		return "", err
	}
	return writeTmpPdf(uuid, pdfBytes)
}
