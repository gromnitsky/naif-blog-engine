# edit this
sync.dest := user@example.com:/home/user-web/user/htdocs/blog/

.PHONY: sync
sync: check
	rsync -avPL --delete -e ssh $(web)/ $(sync.dest)

define help.local :=


sync		rsync to $(sync.dest)
endef
help += $(help.local)



# edit this
.PHONY: fts-deploy
fts-deploy: fts-kill fts-create
	$(fts.server) &

# edit this
.PHONY: fts-kill
fts-kill:
	-pkill -f '$(fts.server)'

fts.server := node $(fts)/nbe-fts-server $(fts.db)
