CREATE TABLE public."USERS"
(
    "USERNAME" character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "PASSWORD" character varying(10) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "USERS_pkey" PRIMARY KEY ("USERNAME")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."USERS"
    OWNER to postgres;

CREATE TABLE public."USER_LINKS"
(
    "USER" character varying COLLATE pg_catalog."default" NOT NULL,
    "LINK" character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "USER_FOREIGN_KEY" FOREIGN KEY ("USER")
        REFERENCES public."USERS" ("USERNAME") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."USER_LINKS"
    OWNER to postgres;