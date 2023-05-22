package main

import (
	"GMVivWiki/utils"
	"encoding/json"
	"os"
	"path"
	"regexp"
)

// AllowIP comment
type AllowIP struct {
	IPRegexp string `json:"IPRegexp"`
	Allow    bool   `json:"Allow"`
	Comment  string `json:"Comment"`
}

// MainConfig comment
type MainConfig struct {
	ListenPort       string    `json:"ListenPort"`
	WebRoot          string    `json:"WebRoot"`
	AllowIPList      []AllowIP `json:"AllowIPList"`
	PublicPathList   []string  `json:"PublicPathList"`
	SupportExportPDF bool      `json:"SupportExportPDF"`
}

var (
	MainConfigFile = "config/GMVivWikiConfig.json"
)

var mainConfig MainConfig
var allowList []*regexp.Regexp
var publicList []*regexp.Regexp

func initGlobals() error {
	basepath, err := utils.GetExecutableFullpath()
	if err != nil {
		return err
	}
	MainConfigFile = path.Join(basepath, MainConfigFile)

	contentBytes, err := os.ReadFile(MainConfigFile)
	if err != nil {
		return err
	}
	err = json.Unmarshal(contentBytes, &mainConfig)
	if err != nil {
		return err
	}

	if !IsAbs(mainConfig.WebRoot) {
		mainConfig.WebRoot = path.Join(basepath, mainConfig.WebRoot)
	}

	for _, v := range mainConfig.AllowIPList {
		if v.Allow {
			allowList = append(allowList, regexp.MustCompile(v.IPRegexp))
		}
	}

	for _, v := range mainConfig.PublicPathList {
		publicList = append(publicList, regexp.MustCompile(v))
	}

	return nil
}

// IsAbs reports whether the path is absolute.
func IsAbs(path string) bool {
	regWinAbs := regexp.MustCompile(`^[a-zA-Z]:\\`)
	return len(path) > 0 && (path[0] == '/' || regWinAbs.MatchString(path))
}
