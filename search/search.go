package search

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"html/template"
	"os"
	"path"
	"path/filepath"
	"strings"
)

type Result struct {
	Urlpath string
	Text    template.HTML
}

func GetFileList(directory string) ([]string, error) {
	entryList, err := os.ReadDir(directory)
	if err != nil {
		return nil, err
	}
	var result []string
	for _, v := range entryList {
		if v.IsDir() {
			l, err := GetFileList(path.Join(directory, v.Name()))
			if err != nil {
				return nil, err
			}
			result = append(result, l...)
		} else {
			if strings.HasSuffix(v.Name(), ".md") {
				result = append(result, path.Join(directory, v.Name()))
			}
		}
	}
	return result, nil
}

// directory mainConfig.WebRoot
func GetUrlpath(directory, f string) string {
	urlpath, err := filepath.Rel(directory, f)
	if err != nil {
		fmt.Printf("get urlpath of %v error: %v\n", f, err)
		return ""
	}
	return urlpath
}

func GetFileID(f string) string {
	h := sha256.New()
	h.Write([]byte(f))
	return hex.EncodeToString(h.Sum(nil))
}
