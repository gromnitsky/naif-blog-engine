# edit this
sync.dest := user@example.com:/home/user-web/user/htdocs/blog/

.PHONY: sync
sync: check
	rsync -avPL --delete -e ssh $(web)/ $(sync.dest)

define help.local :=


sync		rsync to $(sync.dest)
endef
help += $(help.local)



out.fts := fts
fts.db := $(out.fts)/db.sqlite3

$(fts.db): $(out)/web/index.json
	$(mkdir)
	$(mk)/fts-create $< $@
	git -C $(out.fts) init
	git -C $(out.fts) add .
	-git -C $(out.fts) commit -m upd

fts.server.src := $(mk)/nbe-fts-server $(mk)/lib/fts.js
fts.server.dest := $(patsubst $(mk)/%, $(out.fts)/%, $(fts.server.src))

$(out.fts)/%: $(mk)/%
	$(mkdir)
	$(copy)

.PHONY: fts-create
fts-create: $(fts.db) $(fts.server.dest)

# edit this
.PHONY: fts-deploy
fts-deploy: fts-kill fts-create
	$(fts.server) &

# edit this
.PHONY: fts-deploy
fts-kill:
	-pkill -f '$(fts.server)'

fts.server := node $(out.fts)/nbe-fts-server $(fts.db)
