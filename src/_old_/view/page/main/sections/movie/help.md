# How to execute rendering script on BB5

Here is how to start the movie generation with 4 nodes:

```sh
ssh bbpv1
cd <your folder>
chmod a+x activate.sh
./activate.sh 4
```

The script will allocate 4 nodes for you and release them as soon as the rendering is done.

The resulting frames and movie will be stored in the `output/` subfolder.
