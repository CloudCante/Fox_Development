CREATE TABLE public.fixture_maintenance (
    primary_key integer NOT NULL,
    fixture_id integer,
    event_type character varying(32),
    start_date_time timestamp with time zone,
    end_date_time timestamp with time zone,
    occurance character varying(32),
    comments character varying(256),
    is_completed BOOLEAN DEFAULT FALSE,
    creator character varying(32),
    create_date timestamp with time zone,
    CONSTRAINT fixture_maintenance_event_type_check CHECK (
                                                            ((event_type)::text = 'Scheduled Maintenance'::text) OR 
                                                            ((event_type)::text = 'Emergency Maintenance'::text) OR 
                                                            ((event_type)::text = 'Unknown Outage'::text)
                                                          ),
    CONSTRAINT fixture_maintenance_occurance_check CHECK (
                                                            ((occurance)::text = 'Daily'::text) OR 
                                                            ((occurance)::text = 'Weekly'::text) OR 
                                                            ((occurance)::text = 'Monthly'::text) OR 
                                                            ((occurance)::text = 'Quarterly'::text) OR 
                                                            ((occurance)::text = 'Once'::text)
                                                         )
);

ALTER TABLE public.fixture_maintenance ALTER COLUMN primary_key ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.fixture_maintenance_primary_key_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY public.fixture_maintenance
    ADD CONSTRAINT fixture_maintenance_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);

