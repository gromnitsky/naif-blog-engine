# edit this
sync.dest := user@example.com:/home/user-web/user/htdocs/blog/

.PHONY: sync
sync: check
	rsync -avPL --delete -e ssh $(web)/ $(sync.dest)

define help.local :=


sync		rsync to $(sync.dest)
endef
help += $(help.local)



.PHONY: fts-run
fts-run: fts-kill fts check
	$(fts.server) &

.PHONY: fts-kill
fts-kill:
	-pkill -f '$(fts.server)'

fts.server := node $(mk)/node_modules/.bin/nfts-server $(fts.db)

define help.local :=

fts-run		run `$(fts.server)`
fts-kill	kill the FTS server process
endef
help += $(help.local)
