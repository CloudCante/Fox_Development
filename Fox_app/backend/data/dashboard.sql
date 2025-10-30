--
-- PostgreSQL database dump
--

\restrict QOGY1aRhvGgPsExdelwE5gKB6Hf1DI49y2SBOIBSJObYI0DfjICkuXfeQTbaMtr

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-24 15:31:45

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
-- TOC entry 7 (class 2615 OID 16387)
-- Name: pgagent; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgagent;


ALTER SCHEMA pgagent OWNER TO postgres;

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA pgagent; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA pgagent IS 'pgAgent system tables';


--
-- TOC entry 2 (class 3079 OID 16388)
-- Name: pgagent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgagent WITH SCHEMA pgagent;


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgagent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgagent IS 'A PostgreSQL job scheduler';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 24750)
-- Name: fixtures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixtures (
    id integer NOT NULL,
    tester_type character varying(32),
    fixture_id character varying(32),
    rack character varying(32),
    fixture_sn character varying(32),
    test_type character varying(32),
    ip_address character varying(16),
    mac_address character varying(32),
    parent integer,
    creator character varying(32),
    create_date timestamp with time zone,
    CONSTRAINT fixtures_test_type_check CHECK ((((test_type)::text = 'Refurbish'::text) OR ((test_type)::text = 'Sort'::text) OR ((test_type)::text = 'NA'::text))),
    CONSTRAINT fixtures_tester_type_check CHECK ((((tester_type)::text = 'B Tester'::text) OR ((tester_type)::text = 'LA Slot'::text) OR ((tester_type)::text = 'RA Slot'::text)))
);


ALTER TABLE public.fixtures OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 24749)
-- Name: fixtures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.fixtures ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.fixtures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 24763)
-- Name: health; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health (
    primary_key integer NOT NULL,
    fixture_id integer,
    status character varying(32),
    comments character varying(256),
    creator character varying(32),
    create_date timestamp with time zone,
    CONSTRAINT health_status_check CHECK ((((status)::text = 'active'::text) OR ((status)::text = 'no_response'::text) OR ((status)::text = 'under_maintenance'::text) OR ((status)::text = 'RMA'::text)))
);


ALTER TABLE public.health OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 24762)
-- Name: health_primary_key_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.health ALTER COLUMN primary_key ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.health_primary_key_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 243 (class 1259 OID 24775)
-- Name: usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usage (
    primary_key integer NOT NULL,
    fixture_id integer,
    test_slot character varying(32),
    test_station character varying(256),
    test_type character varying(32),
    gpu_pn character varying(32),
    gpu_sn character varying(32),
    log_path character varying(256),
    creator character varying(32),
    create_date timestamp with time zone,
    CONSTRAINT usage_test_slot_check CHECK ((((test_slot)::text = 'Left'::text) OR ((test_slot)::text = 'Right'::text))),
    CONSTRAINT usage_test_type_check CHECK ((((test_type)::text = 'Refurbish'::text) OR ((test_type)::text = 'Sort'::text) OR ((test_type)::text = 'NA'::text)))
);


ALTER TABLE public.usage OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 24774)
-- Name: usage_primary_key_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usage ALTER COLUMN primary_key ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usage_primary_key_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4694 (class 0 OID 16389)
-- Dependencies: 223
-- Data for Name: pga_jobagent; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobagent (jagpid, jaglogintime, jagstation) FROM stdin;
7128	2025-09-15 08:18:37.022657-04	LAPTOP-IUPETGK1
\.


--
-- TOC entry 4695 (class 0 OID 16398)
-- Dependencies: 225
-- Data for Name: pga_jobclass; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobclass (jclid, jclname) FROM stdin;
\.


--
-- TOC entry 4696 (class 0 OID 16408)
-- Dependencies: 227
-- Data for Name: pga_job; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_job (jobid, jobjclid, jobname, jobdesc, jobhostagent, jobenabled, jobcreated, jobchanged, jobagentid, jobnextrun, joblastrun) FROM stdin;
\.


--
-- TOC entry 4698 (class 0 OID 16456)
-- Dependencies: 231
-- Data for Name: pga_schedule; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_schedule (jscid, jscjobid, jscname, jscdesc, jscenabled, jscstart, jscend, jscminutes, jschours, jscweekdays, jscmonthdays, jscmonths) FROM stdin;
\.


--
-- TOC entry 4699 (class 0 OID 16484)
-- Dependencies: 233
-- Data for Name: pga_exception; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_exception (jexid, jexscid, jexdate, jextime) FROM stdin;
\.


--
-- TOC entry 4700 (class 0 OID 16498)
-- Dependencies: 235
-- Data for Name: pga_joblog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_joblog (jlgid, jlgjobid, jlgstatus, jlgstart, jlgduration) FROM stdin;
\.


--
-- TOC entry 4697 (class 0 OID 16432)
-- Dependencies: 229
-- Data for Name: pga_jobstep; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobstep (jstid, jstjobid, jstname, jstdesc, jstenabled, jstkind, jstcode, jstconnstr, jstdbname, jstonerror, jscnextrun) FROM stdin;
\.


--
-- TOC entry 4701 (class 0 OID 16514)
-- Dependencies: 237
-- Data for Name: pga_jobsteplog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobsteplog (jslid, jsljlgid, jsljstid, jslstatus, jslresult, jslstart, jslduration, jsloutput) FROM stdin;
\.


--
-- TOC entry 4926 (class 0 OID 24750)
-- Dependencies: 239
-- Data for Name: fixtures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fixtures (id, tester_type, fixture_id, rack, fixture_sn, test_type, ip_address, mac_address, parent, creator, create_date) FROM stdin;
1	B Tester	NV-NCT01-1	1	AAAAAAAAAA	Refurbish	192.168.102.100	AA:BB:CC:DD	\N	Nicholas	2025-09-23 19:30:40-04
2	LA Slot		1	BBBBBBBBBB	NA	NA	NA	1	Nicholas	2025-09-23 19:30:40-04
3	RA Slot		1	CCCCCCCCCC	NA	NA	NA	1	Nicholas	2025-09-23 19:30:40-04
4	B Tester	NV-NCT02-2	2	DDDDDDDDDD	Refurbish	192.168.102.101	AA:BB:CC:EE	\N	Nicholas	2025-09-23 19:30:40-04
5	LA Slot		2	EEEEEEEEEE	NA	NA	NA	4	Nicholas	2025-09-23 19:30:40-04
6	RA Slot		2	FFFFFFFFFF	NA	NA	NA	4	Nicholas	2025-09-23 19:30:40-04
\.


--
-- TOC entry 4928 (class 0 OID 24763)
-- Dependencies: 241
-- Data for Name: health; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health (primary_key, fixture_id, status, comments, creator, create_date) FROM stdin;
1	1	active	none	Nicholas	2025-09-24 11:26:40-04
2	4	no_response	ping timed out	Nicholas	2025-09-24 11:26:40-04
3	1	no_response	ping timed out	Nicholas	2025-09-24 11:26:40-04
4	1	RMA	sent to PW	Nicholas	2025-09-24 11:26:40-04
5	4	under_maintenance	something	Nick	2025-09-24 11:26:40-04
6	4	active	none	Nicholas	2025-09-24 11:26:40-04
\.


--
-- TOC entry 4930 (class 0 OID 24775)
-- Dependencies: 243
-- Data for Name: usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usage (primary_key, fixture_id, test_slot, test_station, test_type, gpu_pn, gpu_sn, log_path, creator, create_date) FROM stdin;
4	4	Left	BAT	Refurbish	692-2G520-0200-500	1234567890123	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_1234567890123_P_BAT_	Nicholas	2002-10-03 19:30:40-04
5	4	Right	BAT	Refurbish	692-2G520-0200-500	9876543210987	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_9876543210987_P_BAT_	Nicholas	2024-09-23 13:30:40-04
6	4	Left	BIT	Refurbish	692-2G520-0200-500	1234567890123	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_1234567890123_P_BIT_	Nicholas	2025-09-24 19:30:40-04
7	4	Right	BIT	Refurbish	692-2G520-0200-500	9876543210987	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_9876543210987_P_BIT_	Nicholas	2020-01-13 08:30:40-05
8	1	Left	FLB	Refurbish	692-2G520-0200-500	0000000000000	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_0000000000000_P_FLB_	Nicholas	2025-09-23 19:30:40-04
9	1	Left	FLA	Refurbish	692-2G520-0200-500	0000000000000	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_0000000000000_P_FLA_	Nicholas	2025-09-23 19:30:40-04
10	1	Left	FLC	Refurbish	692-2G520-0200-500	0000000000000	/TESLA/G520/692-2G520-0200-500/FXNC_PB_DEBUG_692-2G520-0200-500_0000000000000_P_FLC_	Nicholas	2025-09-23 19:30:40-04
\.


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 238
-- Name: fixtures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fixtures_id_seq', 6, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 240
-- Name: health_primary_key_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_primary_key_seq', 6, true);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 242
-- Name: usage_primary_key_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usage_primary_key_seq', 10, true);


--
-- TOC entry 4772 (class 2606 OID 24756)
-- Name: fixtures fixtures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 24768)
-- Name: health health_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health
    ADD CONSTRAINT health_pkey PRIMARY KEY (primary_key);


--
-- TOC entry 4776 (class 2606 OID 24783)
-- Name: usage usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage
    ADD CONSTRAINT usage_pkey PRIMARY KEY (primary_key);


--
-- TOC entry 4777 (class 2606 OID 24757)
-- Name: fixtures fixtures_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_parent_fkey FOREIGN KEY (parent) REFERENCES public.fixtures(id);


--
-- TOC entry 4778 (class 2606 OID 24769)
-- Name: health health_fixture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health
    ADD CONSTRAINT health_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);


--
-- TOC entry 4779 (class 2606 OID 24784)
-- Name: usage usage_fixture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage
    ADD CONSTRAINT usage_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);


-- Completed on 2025-09-24 15:31:45

--
-- PostgreSQL database dump complete
--

\unrestrict QOGY1aRhvGgPsExdelwE5gKB6Hf1DI49y2SBOIBSJObYI0DfjICkuXfeQTbaMtr

