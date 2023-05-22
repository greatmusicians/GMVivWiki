package main

import (
	"fmt"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
)

func main() {
	err := initGlobals()
	if err != nil {
		fmt.Println(err)
		return
	}

	router := mux.NewRouter()
	router.PathPrefix("/css/").Handler(http.StripPrefix("/css/",
		http.FileServer(http.Dir("template/css/"))))
	router.PathPrefix("/js/").Handler(http.StripPrefix("/js/",
		http.FileServer(http.Dir("template/js/"))))
	router.PathPrefix("/").Handler(
		negroni.New(
			negroni.HandlerFunc(checkAccessAllowed),
			negroni.HandlerFunc(checkPathInWebRoot),
			negroni.HandlerFunc(NewHandler(mainConfig.WebRoot)),
		))

	server := negroni.New(negroni.NewRecovery())
	server.UseHandler(router)

	err = http.ListenAndServe("0.0.0.0:"+mainConfig.ListenPort, server)
	if err != nil {
		fmt.Println(err)
	}
}
