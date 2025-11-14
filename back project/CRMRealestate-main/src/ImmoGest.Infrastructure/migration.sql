CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "Companies" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Email" character varying(254) NOT NULL,
    "Phone" character varying(20) NOT NULL,
    "Website" character varying(200) NULL,
    "Address" character varying(500) NOT NULL,
    "City" character varying(100) NOT NULL,
    "Rc" character varying(50) NULL,
    "Ice" character varying(50) NULL,
    "Image" character varying(500) NULL,
    "Restricted" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Companies" PRIMARY KEY ("Id")
);

CREATE TABLE "Heroes" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Nickname" text NULL,
    "Individuality" text NULL,
    "Age" integer NULL,
    "HeroType" integer NOT NULL,
    "Team" text NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Heroes" PRIMARY KEY ("Id")
);

CREATE TABLE "NavigationItems" (
    "Id" uuid NOT NULL,
    "ItemId" character varying(100) NOT NULL,
    "Title" character varying(200) NOT NULL,
    "TitleEn" character varying(200) NULL,
    "TitleFr" character varying(200) NULL,
    "Type" character varying(50) NULL,
    "Icon" character varying(100) NULL,
    "Link" character varying(500) NULL,
    "ParentId" uuid NULL,
    "Order" integer NOT NULL DEFAULT 0,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_NavigationItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_NavigationItems_NavigationItems_ParentId" FOREIGN KEY ("ParentId") REFERENCES "NavigationItems" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Settings" (
    "Id" uuid NOT NULL,
    "CompanyId" character varying(50) NOT NULL,
    "DefaultCity" character varying(100) NOT NULL,
    "Language" text NULL,
    "CategoriesJson" text NOT NULL,
    "FeaturesJson" text NOT NULL,
    "AmenitiesJson" text NOT NULL,
    "PropertyTypesJson" text NOT NULL,
    "DeletedAt" timestamp with time zone NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Settings" PRIMARY KEY ("Id")
);

CREATE TABLE "Contacts" (
    "Id" uuid NOT NULL,
    "FirstName" character varying(200) NULL,
    "LastName" character varying(200) NULL,
    "CompanyName" character varying(200) NULL,
    "Ice" character varying(50) NULL,
    "Rc" character varying(50) NULL,
    "Identifier" text NOT NULL,
    "Type" integer NOT NULL,
    "IsACompany" boolean NOT NULL DEFAULT FALSE,
    "Email" character varying(200) NULL,
    "Phones" jsonb NULL,
    "Avatar" character varying(500) NULL,
    "CompanyId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Contacts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Contacts_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(254) NOT NULL,
    "Password" character varying(100) NOT NULL,
    "Role" character varying(50) NOT NULL,
    "Avatar" text NULL,
    "Name" text NULL,
    "Phone" text NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CompanyId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Users_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Attachments" (
    "Id" uuid NOT NULL,
    "FileName" character varying(255) NOT NULL,
    "OriginalFileName" text NULL,
    "FileExtension" character varying(50) NOT NULL,
    "FileSize" bigint NOT NULL,
    "Root" character varying(255) NULL,
    "ContactId" uuid NULL,
    "PropertyId" uuid NULL,
    "LeaseId" uuid NULL,
    "ReservationId" uuid NULL,
    "CompanyId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Attachments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Attachments_Contacts_ContactId" FOREIGN KEY ("ContactId") REFERENCES "Contacts" ("Id") ON DELETE SET NULL
);

CREATE TABLE "Buildings" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NULL,
    "Address" character varying(500) NULL,
    "City" character varying(100) NULL,
    "Construction" integer NOT NULL,
    "Year" integer NOT NULL,
    "Description" character varying(1000) NULL,
    "Floor" integer NOT NULL,
    "DefaultAttachmentId" uuid NULL,
    "CompanyId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Buildings" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Buildings_Attachments_DefaultAttachmentId" FOREIGN KEY ("DefaultAttachmentId") REFERENCES "Attachments" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Buildings_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Properties" (
    "Id" uuid NOT NULL,
    "Identifier" character varying(50) NOT NULL,
    "Name" character varying(200) NULL,
    "Description" character varying(1000) NULL,
    "Address" character varying(500) NULL,
    "City" character varying(100) NULL,
    "TypeProperty" character varying(100) NOT NULL,
    "Area" real NOT NULL,
    "Pieces" real NOT NULL,
    "Bathrooms" real NOT NULL,
    "Furnished" boolean NOT NULL,
    "Price" real NOT NULL,
    "TypePaiment" integer NOT NULL,
    "BuildingId" uuid NULL,
    "ContactId" uuid NOT NULL,
    "CompanyId" uuid NOT NULL,
    "DefaultAttachmentId" uuid NULL,
    "Features" text NULL,
    "Equipment" text NULL,
    "Category" integer NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Properties" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Properties_Attachments_DefaultAttachmentId" FOREIGN KEY ("DefaultAttachmentId") REFERENCES "Attachments" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Properties_Buildings_BuildingId" FOREIGN KEY ("BuildingId") REFERENCES "Buildings" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Properties_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Properties_Contacts_ContactId" FOREIGN KEY ("ContactId") REFERENCES "Contacts" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Keys" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Description" character varying(1000) NULL,
    "PropertyId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Keys" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Keys_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Leases" (
    "Id" uuid NOT NULL,
    "TenancyStart" timestamp with time zone NOT NULL,
    "TenancyEnd" timestamp with time zone NOT NULL,
    "PaymentType" integer NOT NULL,
    "PaymentMethod" integer NOT NULL,
    "PaymentDate" integer NOT NULL,
    "RentPrice" double precision NOT NULL,
    "EnableReceipts" boolean NOT NULL DEFAULT FALSE,
    "NotificationWhatsapp" boolean NOT NULL DEFAULT FALSE,
    "NotificationEmail" boolean NOT NULL DEFAULT FALSE,
    "SpecialTerms" character varying(2000) NULL,
    "PrivateNote" character varying(2000) NULL,
    "Status" integer NOT NULL,
    "ContactId" uuid NOT NULL,
    "PropertyId" uuid NOT NULL,
    "CompanyId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "IsArchived" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Leases" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Leases_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Leases_Contacts_ContactId" FOREIGN KEY ("ContactId") REFERENCES "Contacts" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Leases_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Reservations" (
    "Id" uuid NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "DurationDays" integer NOT NULL,
    "Reason" character varying(500) NULL,
    "Description" character varying(2000) NULL,
    "RequestDate" timestamp with time zone NOT NULL,
    "Status" integer NOT NULL,
    "ApprovedBy" uuid NULL,
    "ApprovalDate" timestamp with time zone NULL,
    "ApprovalNotes" character varying(2000) NULL,
    "PrivateNote" character varying(2000) NULL,
    "ContactId" uuid NOT NULL,
    "PropertyId" uuid NOT NULL,
    "CompanyId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
    "IsArchived" boolean NOT NULL DEFAULT FALSE,
    "CreatedOn" timestamp with time zone NOT NULL,
    "LastModifiedOn" timestamp with time zone NULL,
    "SearchTerms" text NULL,
    CONSTRAINT "PK_Reservations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Reservations_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES "Companies" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Reservations_Contacts_ContactId" FOREIGN KEY ("ContactId") REFERENCES "Contacts" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Reservations_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE RESTRICT
);

INSERT INTO "Companies" ("Id", "Address", "City", "CreatedOn", "Email", "Ice", "Image", "LastModifiedOn", "Name", "Phone", "Rc", "Restricted", "SearchTerms", "Website")
VALUES ('687d9fd5-2752-4a96-93d5-0f33a49913c1', 'bassatine', 'tanger', TIMESTAMPTZ '2025-11-06 19:36:21.194096+00:00', 'contact@immosyncpro.com', '51259111', NULL, TIMESTAMPTZ '2025-11-06 19:36:21.194096+00:00', 'IMMOSYNCPRO', '0605934495', '41414111', FALSE, NULL, 'www.immosyncpro.com');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('0d5eac49-520b-43f8-8416-e9e7cc6ca3e6', TIMESTAMPTZ '2025-11-06 19:36:21.19805+00:00', 'heroicons_outline:building-office', 'portfolio', TIMESTAMPTZ '2025-11-06 19:36:21.19805+00:00', NULL, 2, NULL, NULL, 'Portfolio', 'Portfolio', 'Portefeuille', 'collapsible');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('3f5667ce-f967-4b57-96c2-bdaf365524e8', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', 'heroicons_outline:document-text', 'leasing', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', NULL, 3, NULL, NULL, 'Leasing', 'Leasing', 'Location', 'collapsible');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('4433910c-8227-4a5e-bbf1-ef2e83181c16', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', 'heroicons_outline:calendar', 'calendar', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', NULL, 7, NULL, NULL, 'Calendar / Tasks', 'Calendar / Tasks', 'Calendrier / Tâches', 'collapsible');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('4c83e644-7fa9-4b5a-bc41-e2af2803d3c8', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', 'heroicons_outline:cog', TRUE, 'settings', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', '/settings', 10, NULL, NULL, 'Settings / Account', 'Settings / Account', 'Paramètres / Compte', 'basic');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('50faf852-2ccf-4cd5-b65d-84d4c09ac29a', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', 'heroicons_outline:document', 'documents', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', NULL, 5, NULL, NULL, 'Documents', 'Documents', 'Documents', 'collapsible');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('78b204f9-3e3d-4319-a508-b7f000f2f2d2', TIMESTAMPTZ '2025-11-06 19:36:21.19805+00:00', 'heroicons_outline:home', TRUE, 'dashboard', TIMESTAMPTZ '2025-11-06 19:36:21.19805+00:00', '/dashboard', 1, NULL, NULL, 'Dashboard', 'Dashboard', 'Tableau de bord', 'basic');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('79840dcb-e921-478c-b0b6-99b02ab56c8e', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', 'heroicons_outline:wrench-screwdriver', 'maintenance', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', NULL, 8, NULL, NULL, 'Maintenance', 'Maintenance', 'Maintenance', 'collapsible');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('9ce62478-d104-4e95-98bc-ff8edc2d5c99', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', 'heroicons_outline:users', TRUE, 'contacts', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', NULL, 6, NULL, NULL, 'Contacts & Connections', 'Contacts & Connections', 'Contacts et connexions', 'collapsible');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('a925b3a2-dcba-441d-8f05-4932c296b8ee', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', 'heroicons_outline:chart-bar', TRUE, 'reports', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', '/reports', 9, NULL, NULL, 'Reports', 'Reports', 'Rapports', 'basic');

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('e6945641-ed3c-46bd-b162-45a224af6060', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', 'heroicons_outline:question-mark-circle', 'support', TIMESTAMPTZ '2025-11-06 19:36:21.198065+00:00', NULL, 11, NULL, NULL, 'Support / Resource Center', 'Support / Resource Center', 'Support / Centre de ressources', 'collapsible');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('e7f845bb-4014-4c80-b927-87b2af1b6a36', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', 'heroicons_outline:currency-dollar', 'accounting', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', NULL, 4, NULL, NULL, 'Accounting', 'Accounting', 'Comptabilité', 'collapsible');

INSERT INTO "Settings" ("Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "Language", "LastModifiedOn", "PropertyTypesJson", "SearchTerms")
VALUES ('16ece81f-6c51-4bd2-8986-36b5add8c3d6', '["Parking","Laundry","Air conditioning","Heating","Swimming pool","Gym","Security","Elevator","Balcony","Garden","Garage","Pet friendly"]', '[{"Key":"location","Reference":"AL"},{"Key":"vente","Reference":"AV"},{"Key":"vacance","Reference":"VC"}]', '687d9fd5-2752-4a96-93d5-0f33a49913c1', TIMESTAMPTZ '2025-11-06 19:36:21.198235+00:00', 'New York', NULL, '["Alarm","Furnished","Renovated","Hardwood floors","Fireplace","Fresh paint","Dishwasher","Walk-in closets","Balcony, Deck, Patio","Internet","Fenced yard","Tile","Carpet","Storage","Unfurnished"]', 'fr', TIMESTAMPTZ '2025-11-06 19:36:21.198175+00:00', '["Residential","Commercial","Industrial","Mixed Use","Vacation Rental","Investment Property","Luxury","Affordable Housing","Student Housing","Senior Living","Retail Space","Office Space","Warehouse","Land"]', NULL);

INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('1a0c7a52-3d59-4d27-9f24-e55018cd3223', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', 'heroicons_outline:user-plus', 'leads', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', '/leasing/leads', 4, '3f5667ce-f967-4b57-96c2-bdaf365524e8', NULL, 'Leads', 'Leads', 'Prospects', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('1c4a078d-700e-4c10-b4ee-a9f20b9cb4a9', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', 'heroicons_outline:arrow-path', 'recurring-requests', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', '/maintenance/recurring-requests', 3, '79840dcb-e921-478c-b0b6-99b02ab56c8e', NULL, 'Recurring Requests', 'Recurring Requests', 'Demandes récurrentes', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('1e7c3670-1124-4995-a80e-cc8b2df47582', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', 'heroicons_outline:bell', 'reminders', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', '/calendar/reminders', 3, '4433910c-8227-4a5e-bbf1-ef2e83181c16', NULL, 'Reminders', 'Reminders', 'Rappels', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('1ffe43df-5a5b-4728-a0a0-269d50e6a344', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', 'heroicons_outline:link', 'connections', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', '/contacts/connections', 4, '9ce62478-d104-4e95-98bc-ff8edc2d5c99', NULL, 'Connections', 'Connections', 'Connexions', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('23ad72a3-fdb1-4924-b2b6-5a81c884d357', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', 'heroicons_outline:information-circle', 'help-center', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', '/support/help-center', 1, 'e6945641-ed3c-46bd-b162-45a224af6060', NULL, 'Help Center', 'Help Center', 'Centre d''aide', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('2577cd7f-1504-4e48-944e-7d6f74ae4c5c', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', 'heroicons_outline:clock', 'scheduling', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', '/calendar/scheduling', 4, '4433910c-8227-4a5e-bbf1-ef2e83181c16', NULL, 'Scheduling', 'Scheduling', 'Planification', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('2898b91f-00a6-4b79-b6d1-e72715285211', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', 'heroicons_outline:ticket', 'submit-tickets', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', '/support/submit-tickets', 2, 'e6945641-ed3c-46bd-b162-45a224af6060', NULL, 'Submit Tickets', 'Submit Tickets', 'Soumettre des tickets', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('31869457-7d23-4a10-97ac-be63e3ece914', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', 'heroicons_outline:clipboard-document-check', 'tenant-screenings', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', '/leasing/tenant-screenings', 1, '3f5667ce-f967-4b57-96c2-bdaf365524e8', NULL, 'Tenant Screenings', 'Tenant Screenings', 'Sélection de locataires', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('37186f31-c103-4c0c-a973-a22ad07bb347', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', 'heroicons_outline:user', 'tenants', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', '/contacts/tenants', 1, '9ce62478-d104-4e95-98bc-ff8edc2d5c99', NULL, 'Tenants', 'Tenants', 'Locataires', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('418c7394-7906-423f-9995-b1a8338f2483', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', 'heroicons_outline:document-duplicate', 'templates', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', '/documents/templates', 2, '50faf852-2ccf-4cd5-b65d-84d4c09ac29a', NULL, 'Document Templates', 'Document Templates', 'Modèles de documents', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('533f0649-d88b-4de0-bc6b-b545b11c60b1', TIMESTAMPTZ '2025-11-06 19:36:21.198064+00:00', 'heroicons_outline:currency-dollar', 'bids', TIMESTAMPTZ '2025-11-06 19:36:21.198064+00:00', '/maintenance/bids', 4, '79840dcb-e921-478c-b0b6-99b02ab56c8e', NULL, 'Bids', 'Bids', 'Offres', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('59362402-2ce5-487f-8031-1de885c344a5', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', 'heroicons_outline:clipboard-document-list', 'tasks', TIMESTAMPTZ '2025-11-06 19:36:21.198058+00:00', '/calendar/tasks', 2, '4433910c-8227-4a5e-bbf1-ef2e83181c16', NULL, 'Tasks', 'Tasks', 'Tâches', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('59d32ccf-7127-483c-a4bd-4b5315d9ce44', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', 'heroicons_outline:list-bullet', 'listings', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', '/leasing/listings', 2, '3f5667ce-f967-4b57-96c2-bdaf365524e8', NULL, 'Listings', 'Listings', 'Annonces', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('66236f55-9d9f-4f53-aa5c-7d33195cd5b4', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', 'heroicons_outline:credit-card', 'payments', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', '/accounting/payments', 2, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Payments', 'Payments', 'Paiements', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('6f1702ba-7d1d-4049-b9ad-edebf6b85ffc', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', 'heroicons_outline:book-open', 'documentation', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', '/support/documentation', 4, 'e6945641-ed3c-46bd-b162-45a224af6060', NULL, 'Documentation', 'Documentation', 'Documentation', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('7269057a-4e00-48a4-aa74-464b8adfcc34', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', 'heroicons_outline:building-office-2', 'properties', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', '/portfolio/properties', 1, '0d5eac49-520b-43f8-8416-e9e7cc6ca3e6', NULL, 'Properties', 'Properties', 'Propriétés', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('7419eda3-8136-4918-a6d9-3335efdb302c', TIMESTAMPTZ '2025-11-06 19:36:21.198064+00:00', 'heroicons_outline:user-group', 'maintenance-service-pros', TIMESTAMPTZ '2025-11-06 19:36:21.198064+00:00', '/maintenance/service-pros', 5, '79840dcb-e921-478c-b0b6-99b02ab56c8e', NULL, 'Service Pros', 'Service Pros', 'Professionnels du service', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('75a33280-b11e-4729-bfff-f1107d3cd906', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', 'heroicons_outline:banknotes', 'deposits', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', '/accounting/deposits', 3, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Deposits', 'Deposits', 'Dépôts', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('83bda597-c7e3-448a-9507-2072fe326a60', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', 'heroicons_outline:user-circle', 'owners', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', '/contacts/owners', 3, '9ce62478-d104-4e95-98bc-ff8edc2d5c99', NULL, 'Owners', 'Owners', 'Propriétaires', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('92dec1ef-c15a-43c8-a284-128bc2d5b519', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', 'heroicons_outline:clipboard-document-list', 'forms', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', '/documents/forms', 3, '50faf852-2ccf-4cd5-b65d-84d4c09ac29a', NULL, 'Forms', 'Forms', 'Formulaires', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('9409862b-e5ae-449b-8dec-4ec6ab4aab9a', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', 'heroicons_outline:calculator', 'balances', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', '/accounting/balances', 4, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Balances', 'Balances', 'Soldes', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('9c1cb196-64df-484b-9bb9-30586d600029', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', 'heroicons_outline:calendar-days', 'calendar-view', TIMESTAMPTZ '2025-11-06 19:36:21.198057+00:00', '/calendar/calendar-view', 1, '4433910c-8227-4a5e-bbf1-ef2e83181c16', NULL, 'Calendar View', 'Calendar View', 'Vue calendrier', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('9ee50414-5c88-4ab9-9000-6362e9582281', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', 'heroicons_outline:video-camera', 'webinars', TIMESTAMPTZ '2025-11-06 19:36:21.198066+00:00', '/support/webinars', 3, 'e6945641-ed3c-46bd-b162-45a224af6060', NULL, 'Webinars', 'Webinars', 'Webinaires', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('a469c7a2-9de6-4a3c-b4a6-2daab143adff', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', 'heroicons_outline:wrench-screwdriver', 'equipment', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', '/portfolio/equipment', 4, '0d5eac49-520b-43f8-8416-e9e7cc6ca3e6', NULL, 'Equipment', 'Equipment', 'Équipement', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('ac3f0ae4-3656-466f-b851-c848163aa347', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', 'heroicons_outline:receipt-percent', 'invoices', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', '/accounting/invoices', 1, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Invoices', 'Invoices', 'Factures', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('cb4a8cd0-d930-40ce-9caa-202d3c3eb5f4', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', 'heroicons_outline:home-modern', 'units', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', '/portfolio/units', 2, '0d5eac49-520b-43f8-8416-e9e7cc6ca3e6', NULL, 'Units', 'Units', 'Unités', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('d053a5b2-d83e-4fee-9360-41e629496850', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', 'heroicons_outline:folder', 'file-manager', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', '/documents/file-manager', 1, '50faf852-2ccf-4cd5-b65d-84d4c09ac29a', NULL, 'File Manager', 'File Manager', 'Gestionnaire de fichiers', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('d1501190-482e-414e-b3f0-1e968f037be9', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', 'heroicons_outline:arrow-path', 'recurring-transactions', TIMESTAMPTZ '2025-11-06 19:36:21.198054+00:00', '/accounting/recurring-transactions', 5, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Recurring Transactions', 'Recurring Transactions', 'Transactions récurrentes', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('d82c0080-bb00-4308-9834-9c0da7252e00', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', 'heroicons_outline:exclamation-triangle', 'requests', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', '/maintenance/requests', 1, '79840dcb-e921-478c-b0b6-99b02ab56c8e', NULL, 'Requests', 'Requests', 'Demandes', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('dadfc19c-6e3c-402a-b4b3-b99b55fce979', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', 'heroicons_outline:user-group', 'service-pros', TIMESTAMPTZ '2025-11-06 19:36:21.198056+00:00', '/contacts/service-pros', 2, '9ce62478-d104-4e95-98bc-ff8edc2d5c99', NULL, 'Service Pros', 'Service Pros', 'Professionnels du service', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('ddd9de9e-a20b-4e5e-a0e4-ac37f56afa27', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', 'heroicons_outline:cog-6-tooth', 'management-tools', TIMESTAMPTZ '2025-11-06 19:36:21.198055+00:00', '/accounting/management-tools', 6, 'e7f845bb-4014-4c80-b927-87b2af1b6a36', NULL, 'Management Tools', 'Management Tools', 'Outils de gestion', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('e1d90454-0c8f-4ac0-ba54-dc96a398925c', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', 'heroicons_outline:key', 'keys-locks', TIMESTAMPTZ '2025-11-06 19:36:21.198051+00:00', '/portfolio/keys-locks', 3, '0d5eac49-520b-43f8-8416-e9e7cc6ca3e6', NULL, 'Keys & Locks', 'Keys & Locks', 'Clés et serrures', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('e58692f9-f6d8-4eb0-8712-db20ec4b91d7', TIMESTAMPTZ '2025-11-06 19:36:21.198052+00:00', 'heroicons_outline:document-plus', 'applications', TIMESTAMPTZ '2025-11-06 19:36:21.198053+00:00', '/leasing/applications', 3, '3f5667ce-f967-4b57-96c2-bdaf365524e8', NULL, 'Applications', 'Applications', 'Candidatures', 'basic');
INSERT INTO "NavigationItems" ("Id", "CreatedOn", "Icon", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type")
VALUES ('e710b88f-e9a8-428d-9ccf-7315141879da', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', 'heroicons_outline:clipboard-document', 'request-board', TIMESTAMPTZ '2025-11-06 19:36:21.198059+00:00', '/maintenance/request-board', 2, '79840dcb-e921-478c-b0b6-99b02ab56c8e', NULL, 'Request Board', 'Request Board', 'Tableau des demandes', 'basic');

INSERT INTO "Users" ("Id", "Avatar", "CompanyId", "CreatedOn", "Email", "LastModifiedOn", "Name", "Password", "Phone", "Role", "SearchTerms")
VALUES ('687d9fd5-2752-4a96-93d5-0f33a49913c1', NULL, '687d9fd5-2752-4a96-93d5-0f33a49913c1', TIMESTAMPTZ '2025-11-06 19:36:20.950857+00:00', 'admin@admin.com', TIMESTAMPTZ '2025-11-06 19:36:20.950857+00:00', NULL, '$2a$11$B38rg1eeev./PWZszTtGJ.YJ8YT4oWgnQkeGmybb/x5fdV7RQVfiu', NULL, 'Admin', NULL);
INSERT INTO "Users" ("Id", "Avatar", "CompanyId", "CreatedOn", "Email", "LastModifiedOn", "Name", "Password", "Phone", "Role", "SearchTerms")
VALUES ('687d9fd5-2752-4a96-93d5-0f33a49913c2', NULL, '687d9fd5-2752-4a96-93d5-0f33a49913c1', TIMESTAMPTZ '2025-11-06 19:36:21.07191+00:00', 'user@boilerplate.com', TIMESTAMPTZ '2025-11-06 19:36:21.07191+00:00', NULL, '$2a$11$Myjpm82pKcgiSdsB9pEFjesn3axtFSkrJkvfIybSp.nh80FKusW0q', NULL, 'User', NULL);

CREATE INDEX "IX_Attachments_ContactId" ON "Attachments" ("ContactId");

CREATE INDEX "IX_Attachments_LeaseId" ON "Attachments" ("LeaseId");

CREATE INDEX "IX_Attachments_PropertyId" ON "Attachments" ("PropertyId");

CREATE INDEX "IX_Attachments_ReservationId" ON "Attachments" ("ReservationId");

CREATE INDEX "IX_Buildings_CompanyId" ON "Buildings" ("CompanyId");

CREATE INDEX "IX_Buildings_DefaultAttachmentId" ON "Buildings" ("DefaultAttachmentId");

CREATE UNIQUE INDEX "IX_Companies_Email" ON "Companies" ("Email");

CREATE INDEX "IX_Contacts_CompanyId" ON "Contacts" ("CompanyId");

CREATE INDEX "IX_Keys_PropertyId" ON "Keys" ("PropertyId");

CREATE INDEX "IX_Leases_CompanyId" ON "Leases" ("CompanyId");

CREATE INDEX "IX_Leases_ContactId" ON "Leases" ("ContactId");

CREATE INDEX "IX_Leases_PropertyId" ON "Leases" ("PropertyId");

CREATE INDEX "IX_NavigationItems_ItemId" ON "NavigationItems" ("ItemId");

CREATE INDEX "IX_NavigationItems_Order" ON "NavigationItems" ("Order");

CREATE INDEX "IX_NavigationItems_ParentId" ON "NavigationItems" ("ParentId");

CREATE INDEX "IX_Properties_BuildingId" ON "Properties" ("BuildingId");

CREATE INDEX "IX_Properties_CompanyId" ON "Properties" ("CompanyId");

CREATE INDEX "IX_Properties_ContactId" ON "Properties" ("ContactId");

CREATE INDEX "IX_Properties_DefaultAttachmentId" ON "Properties" ("DefaultAttachmentId");

CREATE UNIQUE INDEX "IX_Properties_Identifier" ON "Properties" ("Identifier");

CREATE INDEX "IX_Reservations_CompanyId" ON "Reservations" ("CompanyId");

CREATE INDEX "IX_Reservations_ContactId" ON "Reservations" ("ContactId");

CREATE INDEX "IX_Reservations_PropertyId" ON "Reservations" ("PropertyId");

CREATE INDEX "IX_Settings_CompanyId" ON "Settings" ("CompanyId");

CREATE INDEX "IX_Settings_IsDeleted" ON "Settings" ("IsDeleted");

CREATE INDEX "IX_Users_CompanyId" ON "Users" ("CompanyId");

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

ALTER TABLE "Attachments" ADD CONSTRAINT "FK_Attachments_Leases_LeaseId" FOREIGN KEY ("LeaseId") REFERENCES "Leases" ("Id") ON DELETE SET NULL;

ALTER TABLE "Attachments" ADD CONSTRAINT "FK_Attachments_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE SET NULL;

ALTER TABLE "Attachments" ADD CONSTRAINT "FK_Attachments_Reservations_ReservationId" FOREIGN KEY ("ReservationId") REFERENCES "Reservations" ("Id") ON DELETE SET NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251106193621_InitialCreate', '7.0.13');

COMMIT;

