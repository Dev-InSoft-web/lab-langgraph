export type IEncabezado = {
	resultado: boolean;
	mensaje: string;
	codigo?: number;
};

export type IRespuesta<T = unknown> = {
	datos?: T;
	lista?: T[];
	total?: number;
	detalle?: Record<string, unknown>;
};

export type IspgenResponse<T = unknown> = {
	encabezado: IEncabezado;
	respuesta: IRespuesta<T>;
};

export function rspOk<T>(datos: T, extra?: Partial<IRespuesta<T>>): IspgenResponse<T> {
	return {
		encabezado: { resultado: true, mensaje: "" },
		respuesta: { datos, ...extra },
	};
}

export function rspList<T>(lista: T[], total: number, extra?: Partial<IRespuesta<T>>): IspgenResponse<T> {
	return {
		encabezado: { resultado: true, mensaje: "" },
		respuesta: { lista, total, ...extra },
	};
}

export function rspErr(mensaje: string, codigo = 400): IspgenResponse<never> {
	return {
		encabezado: { resultado: false, mensaje, codigo },
		respuesta: {},
	};
}
