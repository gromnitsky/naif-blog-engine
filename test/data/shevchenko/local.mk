# edit this
sync.dest := user@example.com:/home/user-web/user/htdocs/blog/

.PHONY: sync
sync: check
	rsync -avPL --delete -e ssh $(web)/ $(sync.dest)

define help.local :=


sync		rsync to $(sync.dest)
endef
help += $(help.local)
