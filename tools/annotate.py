# annotate calligraphy photographs for pix2pix training
# lingdong huang 2018

# usage:
# python annotate.py image.png [-s size]
# optional arguments:
#   -s : single character size (default 220)

import cv2
import numpy as np
import random
import json
import sys

down = False
shapes = []

mx,my = -1,-1

sysargs = sys.argv[1:]

W = 500
CW = 220

for i in range(0,len(sysargs)):
    if sysargs[i] == "-s":
        CW = int(sysargs[i+1])
        sysargs[i] = ""
        sysargs[i+1] = ""
sysargs = [a for a in sysargs if a != ""]

fname = sysargs[0]
print fname
im0 = cv2.imread(fname)
xoff = yoff = 0

F = json.loads(open('out.json','r').read())

def distance(p0,p1):
    return ((p0[0]-p1[0])**2+(p0[1]-p1[1])**2)**0.5

def mousePosition(event,x,y,flags,param):
    global down,mx,my
    if event == cv2.EVENT_MOUSEMOVE:
        mx,my = x+xoff,y+yoff
        if down and len(shapes) > 0:
            try:
                if len(shapes[-1]['lines'][-1]) == 0:
                    shapes[-1]['lines'][-1].append((mx,my))
                else:
                    if distance(shapes[-1]['lines'][-1][-1],(mx,my)) > 6:
                        shapes[-1]['lines'][-1].append((mx,my))
            except:
                print "err"

cv2.namedWindow('image')
cv2.setMouseCallback('image',mousePosition)

img = None



def window():
    global img, im0, W, xoff, yoff
    xoff = min(max(xoff,0),im0.shape[1]-W)
    yoff = min(max(yoff,0),im0.shape[0]-W)
    img = cv2.resize(im0[yoff:yoff+W,xoff:xoff+W],(W,W))
    cv2.putText(img,"[S] new char; [A] stroke; [Arrow] pan [O] save; [Z] undo",
        (10,20),cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,255,255))
window()

def save():
    S = json.loads(json.dumps(shapes))
    for s in S:
        l = s['lines']
        p = s['coord']

        for i in range(0,len(l)):
            for j in range(0,len(l[i])):
                l[i][j] = list(l[i][j])
                l[i][j][0] = (l[i][j][0] - p[0]) * (1.0/CW)
                l[i][j][1] = (l[i][j][1] - p[1]) * (1.0/CW)
        s['file'] = fname
        s['coord']= (p[0],p[1],p[0]+CW,p[1]+CW)
    open('out.json','w').write(json.dumps(F+S))

while(1):
    for s in shapes:
        l = s['lines']
        p = s['coord']

        for i in range(0,len(l)):
            for j in range(1,len(l[i])):
                p0 = (l[i][j-1][0]-xoff,l[i][j-1][1]-yoff)
                p1 = (l[i][j][0]-xoff,l[i][j][1]-yoff)
                cv2.line(img,p0,p1,(0,0,255),2)
                cv2.circle(img,p0,4,(0,0,255),-1)
                cv2.circle(img,p1,4,(0,255,255),-1)
                
        cv2.rectangle(img,(p[0]-xoff,p[1]-yoff),(p[0]+CW-xoff,p[1]+CW-yoff),(0,255,255),2)

    if down:
        img[0:10,0:10] = [0,0,255]
    else:
        img[0:10,0:10] = [0,0,0]

    cv2.imshow("image",img)

    k = cv2.waitKey(1) & 0xFF

    if k == ord('a'):
        
        if len(shapes) > 0:
            down = not down
            if down:
                shapes[-1]['lines'].append([])
        else:
            print "NEED FRAME FIRST!"

    elif k == ord('z'):
        down = False
        if len(shapes) > 0:
            if len(shapes[-1]['lines']) == 0:
                shapes = shapes[:-1]
            else:
                for i in range(1,len(shapes[-1]['lines'])+1):
                    if len(shapes[-1]['lines'][-i]) > 0:
                        shapes[-1]['lines'] = shapes[-1]['lines'][:-i]
                        break
            window()

    elif k == ord("s"):
        down = False
        if len(shapes) > 0 and len(shapes[-1]['lines']) == 0:
            shapes[-1]['coord']=(mx,my)
            window()
        else:
            shapes.append({'coord':(mx,my),"lines":[]})

    elif k == 2:
        xoff -= 100
        window()
    elif k == 1:
        yoff += 100
        window()
    elif k == 0:
        yoff -= 100
        window()
    elif k == 3:
        xoff += 100
        window()
    elif k == 27:
        break
    elif k == ord('o'):
        save()
    elif k != 255:
        print k

cv2.destroyAllWindows()