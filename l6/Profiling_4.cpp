#include<stdio.h>

void new_func1(void);

void DrawCat(void)
{
    for(int i = 0; i < 1000000000; i++)
	{
		//process of drawing
		sleep(1000);
	}

    return;
}

static void DrawDog(void)
{
    for(int i = 0; i < 1000000000; i++)
	{
		//process of drawing
		sleep(1000);
	}
    return;
}

int main(void)
{
    printf("\n Inside main()\n");
	string typeOfShape;
	scanf("%s", typeOfShape);
	
    int i = 0;

    for(;i<0xffffff;i++);
	switch(typeOfShape){
	case "dog":
	    DrawDog();
		break;
	case "cat":
		DrawCat();
		break;
	}

    return 0;
}