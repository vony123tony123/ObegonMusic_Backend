--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-10-15 21:31:39

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 225 (class 1255 OID 16576)
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16536)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    announcement_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content_url text NOT NULL,
    create_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    views integer DEFAULT 0
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16587)
-- Name: announcements_announcement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.announcements ALTER COLUMN announcement_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.announcements_announcement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16561)
-- Name: article_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_tags (
    article_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.article_tags OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16516)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    article_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content_url text NOT NULL,
    create_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id bigint,
    category_id bigint,
    views integer DEFAULT 0,
    description text
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16588)
-- Name: articles_article_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.articles ALTER COLUMN article_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.articles_article_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16507)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    create_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16498)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    tag_id bigint NOT NULL,
    tag_name text NOT NULL,
    create_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16493)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    create_time timestamp without time zone,
    update_time timestamp without time zone,
    "UUID" uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4847 (class 0 OID 16536)
-- Dependencies: 221
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (announcement_id, title, content_url, create_time, update_time, views) FROM stdin;
1	版本 1.0 上線！我們需要你的回饋！	version1.0-online	2025-05-24 17:04:43.387481	2025-05-25 15:38:19.401552	0
3	一個新的標題	tmp	2025-10-11 23:03:09.583354	2025-10-11 23:03:09.583354	0
7	New Announcement for Testing	/storage/announcement/test.mdx	2025-10-12 00:18:11.644219	2025-10-12 00:18:11.644219	0
\.


--
-- TOC entry 4848 (class 0 OID 16561)
-- Dependencies: 222
-- Data for Name: article_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_tags (article_id, tag_id) FROM stdin;
1	1
1	2
1	3
1	4
\.


--
-- TOC entry 4846 (class 0 OID 16516)
-- Dependencies: 220
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (article_id, title, content_url, create_time, update_time, user_id, category_id, views, description) FROM stdin;
1	專輯談：坂本龍一《12》｜大師生命終章的日記與風鈴	storage/article/0001.mdx	2025-05-05 20:57:00.18228	2025-05-05 20:57:00.18228	1	1	0	\N
\.


--
-- TOC entry 4845 (class 0 OID 16507)
-- Dependencies: 219
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, name, create_time, update_time) FROM stdin;
1	專輯	2025-05-03 20:06:08.728975	2025-05-03 20:06:08.728975
\.


--
-- TOC entry 4844 (class 0 OID 16498)
-- Dependencies: 218
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (tag_id, tag_name, create_time, update_time) FROM stdin;
1	音樂評論	2025-05-03 19:44:13.315851	2025-05-03 19:44:13.315851
2	坂本龍一	2025-05-03 19:45:54.109123	2025-05-03 19:45:54.109123
3	音樂	2025-05-03 19:46:08.684008	2025-05-03 19:46:08.684008
4	專輯談	2025-05-03 19:48:28.558548	2025-05-03 19:48:28.558548
\.


--
-- TOC entry 4843 (class 0 OID 16493)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, create_time, update_time, "UUID") FROM stdin;
1	學長音樂黑白講	\N	\N	\N
\.


--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 223
-- Name: announcements_announcement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_announcement_id_seq', 9, true);


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 224
-- Name: articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_article_id_seq', 7, true);


--
-- TOC entry 4686 (class 2606 OID 16545)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (announcement_id);


--
-- TOC entry 4688 (class 2606 OID 16565)
-- Name: article_tags article_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_pkey PRIMARY KEY (article_id, tag_id);


--
-- TOC entry 4684 (class 2606 OID 16525)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (article_id);


--
-- TOC entry 4680 (class 2606 OID 16515)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4682 (class 2606 OID 16513)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4676 (class 2606 OID 16583)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (tag_name);


--
-- TOC entry 4678 (class 2606 OID 16504)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);


--
-- TOC entry 4674 (class 2606 OID 16497)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4697 (class 2620 OID 16580)
-- Name: announcements trg_update_announcements; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_announcements BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- TOC entry 4696 (class 2620 OID 16577)
-- Name: articles trg_update_articles; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_articles BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- TOC entry 4695 (class 2620 OID 16579)
-- Name: categories trg_update_categories; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- TOC entry 4694 (class 2620 OID 16578)
-- Name: tags trg_update_tags; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_tags BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- TOC entry 4693 (class 2620 OID 16586)
-- Name: users trg_update_user; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_user BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- TOC entry 4691 (class 2606 OID 16566)
-- Name: article_tags article_tags_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(article_id) ON DELETE CASCADE;


--
-- TOC entry 4692 (class 2606 OID 16571)
-- Name: article_tags article_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id) ON DELETE CASCADE;


--
-- TOC entry 4689 (class 2606 OID 16531)
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- TOC entry 4690 (class 2606 OID 16526)
-- Name: articles articles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


-- Completed on 2025-10-15 21:31:39

--
-- PostgreSQL database dump complete
--

