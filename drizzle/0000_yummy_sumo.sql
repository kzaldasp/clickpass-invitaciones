CREATE TABLE `codigos_acceso` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`codigo_hash` text NOT NULL,
	`expira_en` integer NOT NULL,
	`intentos` integer DEFAULT 0 NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `codigos_acceso_email_idx` ON `codigos_acceso` (`email`);--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`cliente_id` text NOT NULL,
	`plantilla` text NOT NULL,
	`plantilla_version` integer DEFAULT 1 NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`fecha` integer NOT NULL,
	`zona_horaria` text DEFAULT 'America/Guayaquil' NOT NULL,
	`pais` text DEFAULT 'EC' NOT NULL,
	`contenido` text NOT NULL,
	`config_confirmacion` text NOT NULL,
	`fecha_limite_confirmacion` integer,
	`limite_invitados` integer NOT NULL,
	`mensaje_whatsapp` text,
	`prefijo_telefono` text DEFAULT '593' NOT NULL,
	`token_panel` text NOT NULL,
	`precio` integer DEFAULT 0 NOT NULL,
	`moneda` text DEFAULT 'USD' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch()) NOT NULL,
	`finalizado_en` integer,
	FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eventos_slug_unique` ON `eventos` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `eventos_token_panel_unique` ON `eventos` (`token_panel`);--> statement-breakpoint
CREATE INDEX `eventos_cliente_idx` ON `eventos` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `eventos_fecha_idx` ON `eventos` (`fecha`);--> statement-breakpoint
CREATE TABLE `invitados` (
	`id` text PRIMARY KEY NOT NULL,
	`evento_id` text NOT NULL,
	`token` text NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text,
	`pases` integer DEFAULT 1 NOT NULL,
	`nota` text,
	`abierto_en` integer,
	`respuesta` text DEFAULT 'pendiente' NOT NULL,
	`pases_confirmados` integer DEFAULT 0 NOT NULL,
	`mensaje` text,
	`respuestas_extra` text,
	`respondido_en` integer,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitados_token_unique` ON `invitados` (`token`);--> statement-breakpoint
CREATE INDEX `invitados_evento_idx` ON `invitados` (`evento_id`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` text PRIMARY KEY NOT NULL,
	`evento_id` text NOT NULL,
	`monto` integer NOT NULL,
	`metodo` text NOT NULL,
	`nota` text,
	`fecha` integer NOT NULL,
	`registrado_por` text,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`registrado_por`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `pagos_evento_idx` ON `pagos` (`evento_id`);--> statement-breakpoint
CREATE TABLE `sesiones` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`expira_en` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sesiones_usuario_idx` ON `sesiones` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`rol` text NOT NULL,
	`nombre` text NOT NULL,
	`email` text,
	`telefono` text,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);