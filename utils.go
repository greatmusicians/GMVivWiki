package main

import (
	"io/fs"
	"net"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
)

var TemplateExecuteReplacer = strings.NewReplacer(
	"&", "&amp;",
	"<", "&lt;",
	">", "&gt;",
	// "&#34;" is shorter than "&quot;".
	`"`, "&#34;",
	// "&#39;" is shorter than "&apos;" and apos was not in HTML until HTML5.
	"'", "&#39;",
)

func GetExecutableFullpath() (string, error) {
	ePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Dir(ePath), nil
}

// use IP.String() to get a string
func GetIPFromRequest(r *http.Request) net.IP {
	var remoteIP net.IP
	// the default is the originating ip. but we try to find better options because this is almost
	// never the right IP
	if parts := strings.Split(r.RemoteAddr, ":"); len(parts) == 2 {
		remoteIP = net.ParseIP(parts[0])
	}
	// If we have a forwarded-for header, take the address from there
	if xff := strings.Trim(r.Header.Get("X-Forwarded-For"), ","); len(xff) > 0 {
		addrs := strings.Split(xff, ",")
		lastFwd := addrs[len(addrs)-1]
		if ip := net.ParseIP(lastFwd); ip != nil {
			remoteIP = ip
		}
		// parse X-Real-Ip header
	} else if xri := r.Header.Get("X-Real-Ip"); len(xri) > 0 {
		if ip := net.ParseIP(xri); ip != nil {
			remoteIP = ip
		}
	}

	return remoteIP
}

func GetSortedEntryList(directory string) ([]fs.DirEntry, error) {
	entryList, err := os.ReadDir(directory)
	if err != nil {
		return nil, err
	}
	var newList []fs.DirEntry
	for k, v := range entryList {
		if !strings.HasPrefix(v.Name(), ".") {
			newList = append(newList, entryList[k])
		}
	}
	sort.Slice(newList, func(i, j int) bool {
		return newList[i].Name() < newList[j].Name()
	})
	return newList, nil
}

/*
如果是软连接，则继续追踪是否是目录
*/
func IsDir(directory string, entry fs.DirEntry) bool {
	if entry.IsDir() {
		return true
	}
	if entry.Type()&fs.ModeSymlink == 0 {
		return false
	}
	fullpath := path.Join(directory, entry.Name())
	realpath, err := filepath.EvalSymlinks(fullpath)
	if err != nil {
		//invalid link
		return false
	}
	fi, err := os.Stat(realpath)
	if err != nil {
		//invalid link
		return false
	}
	return fi.IsDir()
}
