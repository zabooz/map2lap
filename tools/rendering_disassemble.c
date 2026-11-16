/* Native offline DXBC reader; compile for Windows and link d3dcompiler. No .NET. */
#define COBJMACROS
#include <windows.h>
#include <d3dcompiler.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: reader.exe shader.dxbc [...] (writes shader.dxbc.asm)\n");
        return 1;
    }
    int failed = 0;
    for (int i = 1; i < argc; ++i) {
        FILE *input = fopen(argv[i], "rb");
        if (!input) { perror(argv[i]); failed = 1; continue; }
        fseek(input, 0, SEEK_END);
        long size = ftell(input);
        rewind(input);
        void *data = size > 0 ? malloc((size_t)size) : NULL;
        if (!data || fread(data, 1, (size_t)size, input) != (size_t)size) {
            fclose(input); free(data); failed = 1; continue;
        }
        fclose(input);
        ID3DBlob *result = NULL;
        HRESULT status = D3DDisassemble(data, (SIZE_T)size, 0, NULL, &result);
        free(data);
        if (FAILED(status)) {
            fprintf(stderr, "%s: D3DDisassemble failed (%lx)\n", argv[i], (unsigned long)status);
            failed = 1; continue;
        }
        char *path = malloc(strlen(argv[i]) + 5);
        if (!path) { ID3D10Blob_Release(result); failed = 1; continue; }
        strcpy(path, argv[i]); strcat(path, ".asm");
        FILE *output = fopen(path, "wb");
        if (!output) { perror(path); failed = 1; }
        else {
            size_t length = ID3D10Blob_GetBufferSize(result);
            if (fwrite(ID3D10Blob_GetBufferPointer(result), 1, length, output) != length) failed = 1;
            if (fclose(output)) failed = 1;
        }
        free(path);
        ID3D10Blob_Release(result);
    }
    return failed;
}
